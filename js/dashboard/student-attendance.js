let user, allAttendance, studentBatches;

export async function init() {
    user = window.auth.getUser();
    await loadAttendance();
    document.getElementById('btnRefreshAttendance')?.addEventListener('click', loadAttendance);
    document.getElementById('attBatchFilter')?.addEventListener('change', renderAttendance);
    document.getElementById('attMonthFilter')?.addEventListener('change', renderAttendance);
}

export async function refresh() {
    await loadAttendance();
}

async function loadAttendance() {
    window.tableLoading('attendanceTableBody', 4, 'Loading attendance...');
    window.showStatus('attendanceStatus', '', 'success');

    const [attRes, batchRes] = await Promise.all([
        window.api.get('attendance', { student_id: user.id }, '*, classes:class_id(title, batch_id, batches:batch_id(name, subject))'),
        window.api.get('batch_students', { student_id: user.id }, 'batch_id, batches:batch_id(name, subject)')
    ]);

    if (!attRes.success) {
        window.showStatus('attendanceStatus', attRes.error || 'Failed to load attendance.', 'error');
        return;
    }

    allAttendance = (attRes.data || []).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    studentBatches = batchRes.data || [];

    populateBatchFilter();
    populateMonthFilter();
    renderStats(allAttendance);
    renderCalendar(allAttendance);
    renderAttendance();
}

function populateBatchFilter() {
    const sel = document.getElementById('attBatchFilter');
    if (!sel) return;
    const current = sel.value;
    sel.innerHTML = '<option value="">All Batches</option>';
    studentBatches.forEach(bs => {
        const b = bs.batches || {};
        const opt = document.createElement('option');
        opt.value = bs.batch_id;
        opt.textContent = `${b.name || 'Batch'} (${b.subject || ''})`;
        sel.appendChild(opt);
    });
    if (current) sel.value = current;
}

function populateMonthFilter() {
    const sel = document.getElementById('attMonthFilter');
    if (!sel) return;
    const current = sel.value;

    // Get unique months from attendance data
    const months = [...new Set(
        allAttendance
            .filter(a => a.date)
            .map(a => a.date.slice(0, 7))
    )].sort().reverse();

    sel.innerHTML = '<option value="">All Time</option>';
    months.forEach(m => {
        const [year, month] = m.split('-');
        const label = new Date(Number(year), Number(month) - 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
        const opt = document.createElement('option');
        opt.value = m;
        opt.textContent = label;
        sel.appendChild(opt);
    });
    if (current) sel.value = current;
}

function renderStats(records) {
    const total   = records.length;
    const present = records.filter(r => r.status === 'present').length;
    const absent  = records.filter(r => r.status === 'absent').length;
    const late    = records.filter(r => r.status === 'late').length;
    const pct     = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('attStatTotal',   total);
    set('attStatPresent', present);
    set('attStatAbsent',  absent);
    set('attStatLate',    late);
    set('attStatPct',     total > 0 ? pct + '%' : '—');
}

function renderCalendar(records) {
    const container = document.getElementById('attendanceCalendar');
    if (!container || records.length === 0) {
        if (container) container.innerHTML = '';
        return;
    }

    // Build date → status map (prefer 'absent' > 'late' > 'present' if multiple)
    const priority = { absent: 3, late: 2, present: 1 };
    const dateMap = {};
    records.forEach(r => {
        if (!r.date) return;
        const prev = dateMap[r.date];
        if (!prev || (priority[r.status] || 0) > (priority[prev] || 0)) {
            dateMap[r.date] = r.status;
        }
    });

    // Get the range of months to display
    const dates = Object.keys(dateMap).sort();
    if (dates.length === 0) { container.innerHTML = ''; return; }

    const firstDate = new Date(dates[0]);
    const lastDate  = new Date(dates[dates.length - 1]);

    // Iterate month by month
    let html = '<div style="display:flex;flex-wrap:wrap;gap:1.5rem;">';

    let cur = new Date(firstDate.getFullYear(), firstDate.getMonth(), 1);
    const end = new Date(lastDate.getFullYear(), lastDate.getMonth() + 1, 1);

    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

    while (cur < end) {
        const year  = cur.getFullYear();
        const month = cur.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDow = new Date(year, month, 1).getDay(); // 0=Sun

        html += `<div style="min-width:200px;">`;
        html += `<p style="font-size:0.8rem;font-weight:600;color:var(--text-muted);text-transform:uppercase;margin:0 0 0.5rem;">${monthNames[month]} ${year}</p>`;
        html += `<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px;font-size:0.7rem;text-align:center;">`;

        // Day headers
        ['S','M','T','W','T','F','S'].forEach(d => {
            html += `<div style="color:var(--text-muted);padding-bottom:2px;">${d}</div>`;
        });

        // Empty cells before first day
        for (let i = 0; i < firstDow; i++) {
            html += '<div></div>';
        }

        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
            const status  = dateMap[dateStr];
            let bg = 'transparent';
            let title = '';
            if (status === 'present') { bg = 'var(--success, #22c55e)'; title = 'Present'; }
            else if (status === 'absent') { bg = 'var(--danger, #ef4444)'; title = 'Absent'; }
            else if (status === 'late')   { bg = 'var(--warning, #f59e0b)'; title = 'Late'; }

            html += `<div title="${dateStr}${title ? ' — ' + title : ''}" style="border-radius:3px;background:${bg};color:${status ? 'white' : 'var(--text-secondary)'};padding:2px 0;font-size:0.68rem;">${d}</div>`;
        }

        html += '</div></div>';
        cur.setMonth(cur.getMonth() + 1);
    }

    html += '</div>';
    html += `<div style="display:flex;gap:1rem;margin-top:0.75rem;font-size:0.78rem;color:var(--text-muted);">
        <span><span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:var(--success,#22c55e);margin-right:3px;"></span>Present</span>
        <span><span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:var(--danger,#ef4444);margin-right:3px;"></span>Absent</span>
        <span><span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:var(--warning,#f59e0b);margin-right:3px;"></span>Late</span>
    </div>`;

    container.innerHTML = html;
}

function renderAttendance() {
    const batchFilter = document.getElementById('attBatchFilter')?.value || '';
    const monthFilter = document.getElementById('attMonthFilter')?.value || '';
    const tbody = document.getElementById('attendanceTableBody');

    const filtered = allAttendance.filter(r => {
        if (batchFilter && r.classes?.batch_id !== batchFilter) return false;
        if (monthFilter && r.date && !r.date.startsWith(monthFilter)) return false;
        return true;
    });

    // Update stats for filtered view
    renderStats(filtered);
    renderCalendar(filtered);

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="loading-text">No attendance records found.</td></tr>';
        return;
    }

    const statusColor = { present: 'var(--success,#22c55e)', absent: 'var(--danger,#ef4444)', late: 'var(--warning,#f59e0b)' };
    const statusLabel = { present: 'Present', absent: 'Absent', late: 'Late' };

    tbody.innerHTML = filtered.map(r => {
        const batch   = r.classes?.batches || {};
        const dateStr = r.date ? new Date(r.date).toLocaleDateString('en-IN') : '—';
        const status  = r.status || 'present';
        const color   = statusColor[status] || 'inherit';
        const label   = statusLabel[status] || status;

        return `<tr class="data-table__row">
            <td class="data-table__td">${dateStr}</td>
            <td class="data-table__td">${window.esc(batch.name || '—')}</td>
            <td class="data-table__td">${window.esc(batch.subject || '—')}</td>
            <td class="data-table__td"><span style="font-weight:600;color:${color};">${label}</span></td>
        </tr>`;
    }).join('');
}
