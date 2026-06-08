import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googlesheets');

    // Load all data in parallel
    const [participants, mainCheckins, bonusCheckins, settings] = await Promise.all([
      base44.asServiceRole.entities.Participant.filter({ status: 'active' }),
      base44.asServiceRole.entities.MainCheckIn.filter({ is_valid: true }),
      base44.asServiceRole.entities.BonusCheckIn.filter({ is_valid: true }),
      base44.asServiceRole.entities.CampaignSettings.filter({}),
    ]);

    // Determine campaign date range
    const startSetting = settings.find(s => s.key === 'campaign_start');
    const endSetting = settings.find(s => s.key === 'campaign_end');
    const campaignStart = startSetting?.value || '2026-06-01';
    const campaignEnd = endSetting?.value || '2026-08-31';

    // Build list of all dates from campaign start to today
    const today = new Date().toLocaleDateString('sv', { timeZone: 'Asia/Omsk' }); // YYYY-MM-DD
    const endDate = today < campaignEnd ? today : campaignEnd;

    const dates = [];
    let d = new Date(campaignStart + 'T00:00:00');
    const end = new Date(endDate + 'T00:00:00');
    while (d <= end) {
      dates.push(d.toISOString().slice(0, 10));
      d.setDate(d.getDate() + 1);
    }

    // Index check-ins by participant + date
    const mainSet = new Set(mainCheckins.map(c => `${c.participant_id}::${c.eligible_date}`));
    const bonusMap = {};
    bonusCheckins.forEach(b => {
      const key = `${b.participant_id}::${b.eligible_date}`;
      bonusMap[key] = (bonusMap[key] || 0) + (b.stars_awarded || 1);
    });

    // Sort participants by name
    const sorted = participants
      .filter(p => p.onboarding_complete)
      .sort((a, b) => (a.full_name || '').localeCompare(b.full_name || '', 'ru'));

    // Build header row: Name | Mission% | Streak | date1 | date2 | ...
    const headerRow = ['Имя', 'Мицва %', 'Серия', ...dates.map(d => d.slice(5))]; // show MM-DD

    // Build data rows
    const dataRows = sorted.map(p => {
      const cells = [
        p.full_name || '',
        `${p.mission_progress || 0}%`,
        p.current_streak || 0,
        ...dates.map(date => {
          const key = `${p.id}::${date}`;
          const hasMain = mainSet.has(key);
          const bonusStars = bonusMap[key] || 0;
          if (hasMain && bonusStars > 0) return `✅+${bonusStars}⭐`;
          if (hasMain) return '✅';
          if (bonusStars > 0) return `+${bonusStars}⭐`;
          return '—';
        }),
      ];
      return cells;
    });

    const allRows = [headerRow, ...dataRows];

    // Check if spreadsheet ID is saved in settings
    const sheetSetting = settings.find(s => s.key === 'google_sheet_id');
    let spreadsheetId = sheetSetting?.value;

    if (!spreadsheetId) {
      // Create new spreadsheet
      const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          properties: { title: 'EnerJew Omsk — Отчёт по отметкам' },
          sheets: [{ properties: { title: 'Отметки' } }],
        }),
      });
      const created = await createRes.json();
      spreadsheetId = created.spreadsheetId;

      // Save to settings
      await base44.asServiceRole.entities.CampaignSettings.create({
        key: 'google_sheet_id',
        value: spreadsheetId,
        description_ru: 'ID Google Sheet для отчётов',
      });
    } else {
      // Clear existing data first
      await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Отметки!A1:ZZ1000:clear`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    }

    // Write all rows
    const writeRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Отметки!A1?valueInputOption=RAW`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ values: allRows }),
      }
    );
    await writeRes.json();

    // Bold + freeze header row
    const sheetMetaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const sheetMeta = await sheetMetaRes.json();
    const sheetId = sheetMeta.sheets?.[0]?.properties?.sheetId || 0;

    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            repeatCell: {
              range: { sheetId, startRowIndex: 0, endRowIndex: 1 },
              cell: { userEnteredFormat: { textFormat: { bold: true }, backgroundColor: { red: 0.27, green: 0.51, blue: 0.81 }, foregroundColor: { red: 1, green: 1, blue: 1 } } },
              fields: 'userEnteredFormat(textFormat,backgroundColor,foregroundColor)',
            },
          },
          {
            updateSheetProperties: {
              properties: { sheetId, gridProperties: { frozenRowCount: 1, frozenColumnCount: 1 } },
              fields: 'gridProperties.frozenRowCount,gridProperties.frozenColumnCount',
            },
          },
        ],
      }),
    });

    const sheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;
    return Response.json({ success: true, url: sheetUrl, spreadsheetId });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});