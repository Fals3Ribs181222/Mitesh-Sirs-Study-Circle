let allResults = [];

document.addEventListener('DOMContentLoaded', () => {
    loadResults();

    document.getElementById('filterSubject').addEventListener('change', renderResults);
    document.getElementById('filterYear').addEventListener('change', renderResults);
    document.getElementById('searchName').addEventListener('input', renderResults);
});

async function loadResults() {
    // Fetch board results from the dedicated table
    const response = await api.get('board_results');

    if (response.success) {
        allResults = response.data.map(br => {
            const max = Number(br.max_marks) || 100;
            const obtained = Number(br.marks_obtained);
            const percent = ((obtained / max) * 100).toFixed(1) + '%';

            return {
                studentName: br.student_name || 'Anonymous',
                subject: br.subject || '-',
                marks: obtained,
                overall: `${obtained} / ${max} (${percent})`,
                year: br.passing_year || '-'
            };
        });

        populateFilters();
        renderResults();
    } else {
        const msg = document.getElementById('loadingMsg');
        if (msg) {
            msg.textContent = 'Error loading results: ' + (response.error || 'Unknown error');
            msg.style.color = 'red';
        }
    }
}

function populateFilters() {
    const subjects = new Set();
    const years = new Set();

    allResults.forEach(item => {
        if (item.subject && item.subject !== '-') subjects.add(item.subject);
        if (item.year && item.year !== '-') years.add(item.year);
    });

    const subjSelect = document.getElementById('filterSubject');
    subjects.forEach(subject => {
        const opt = createElement('option', '', subject);
        opt.value = subject;
        subjSelect.appendChild(opt);
    });

    const yearSelect = document.getElementById('filterYear');
    [...years].sort((a, b) => b - a).forEach(yr => {
        const opt = createElement('option', '', yr);
        opt.value = yr;
        yearSelect.appendChild(opt);
    });
}

function renderResults() {
    const tbody = document.getElementById('resultsBody');
    const subjectFilter = document.getElementById('filterSubject').value;
    const yearFilter = document.getElementById('filterYear').value;
    const searchFilter = document.getElementById('searchName').value.toLowerCase();

    let filtered = allResults.filter(item => {
        const matchSubj = subjectFilter === "" || item.subject === subjectFilter;
        const matchYear = yearFilter === "" || String(item.year) === String(yearFilter);
        const matchName = searchFilter === "" || String(item.studentName).toLowerCase().includes(searchFilter);
        return matchSubj && matchYear && matchName;
    });

    // Sort by absolute marks descending
    filtered.sort((a, b) => (b.marks || 0) - (a.marks || 0));

    tbody.innerHTML = '';

    if (filtered.length === 0) {
        const tr = createElement('tr');
        const td = createElement('td', 'empty-state', 'No results found matching your criteria.');
        td.colSpan = 5;
        tr.appendChild(td);
        tbody.appendChild(tr);
        return;
    }

    filtered.forEach(item => {
        const tr = createElement('tr');

        tr.appendChild(createElement('td', '', item.studentName));
        tr.appendChild(createElement('td', '', item.subject));
        tr.appendChild(createElement('td', 'data-table__score', item.marks));
        tr.appendChild(createElement('td', '', item.overall));
        tr.appendChild(createElement('td', '', item.year));

        tbody.appendChild(tr);
    });
}
