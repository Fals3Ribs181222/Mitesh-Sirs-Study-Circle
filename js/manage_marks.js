const user = auth.requireRole('teacher');
const urlParams = new URLSearchParams(window.location.search);
const testId = urlParams.get('testId');

if (!testId) {
    alert('No Test ID specified.');
    window.location.href = 'teacher_dashboard';
}

let currentTest = null;
let allStudents = [];
let existingMarks = [];

document.addEventListener('DOMContentLoaded', init);

async function init() {
    try {
        const [testsRes, studentsRes, marksRes] = await Promise.all([
            api.get('tests'),
            api.get('profiles', { role: 'student' }),
            api.get('marks', { test_id: testId })
        ]);

        if (!testsRes.success || !studentsRes.success || !marksRes.success) {
            throw new Error('Failed to fetch data from Supabase.');
        }

        currentTest = testsRes.data.find(t => t.id === testId);
        if (!currentTest) {
            throw new Error('Test not found.');
        }

        allStudents = studentsRes.data;
        existingMarks = marksRes.data;

        renderPage();
    } catch (err) {
        console.error(err);
        document.getElementById('loadingState').innerHTML = `<p class="status status--error">${err.message}</p>`;
    }
}

function renderPage() {
    document.getElementById('testTitle').textContent = currentTest.title;
    document.getElementById('testMeta').textContent = `Subject: ${currentTest.subject} | Grade: ${currentTest.grade} | Date: ${currentTest.date} | Max Marks: ${currentTest.max_marks}`;

    const targetGrade = String(currentTest.grade).trim();
    const targetSubject = String(currentTest.subject).trim().toLowerCase();

    const eligibleStudents = allStudents.filter(s => {
        const sGrade = String(s.grade).trim();
        const sSubjects = String(s.subjects || '').toLowerCase();
        return sGrade === targetGrade && sSubjects.includes(targetSubject);
    });

    document.getElementById('studentCount').textContent = `${eligibleStudents.length} Students found`;

    const tbody = document.getElementById('marksTableBody');
    const marksMap = {};
    existingMarks.forEach(m => {
        marksMap[m.student_id] = { id: m.id, marks: m.marks_obtained };
    });

    if (eligibleStudents.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="loading-text">No students found matching this Grade and Subject.</td></tr>';
    } else {
        tbody.innerHTML = eligibleStudents.map(s => {
            const markData = marksMap[s.id] || {};
            const existingMark = markData.marks;
            const maxM = Number(currentTest.max_marks) || 100;
            const pct = existingMark !== undefined && existingMark !== '' ? ((Number(existingMark) / maxM) * 100).toFixed(1) + '%' : '-';
            return `
            <tr class="data-table__row">
                <td class="data-table__td--main">${s.name}</td>
                <td class="data-table__td">${s.username || '-'}</td>
                <td class="data-table__td">
                    <input type="number"
                        class="form__control form__control--narrow student-mark-input"
                        data-student-id="${s.id}"
                        data-mark-id="${markData.id || ''}"
                        value="${existingMark !== undefined ? existingMark : ''}"
                        min="0"
                        max="${currentTest.max_marks}"
                        placeholder="Max: ${currentTest.max_marks}"
                    >
                </td>
                <td class="data-table__td pct-cell">${pct}</td>
            </tr>
        `}).join('');
    }

    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('marksTableContainer').hidden = false;

    updatePerformanceSummary();
}

function updatePerformanceSummary() {
    const inputs = document.querySelectorAll('.student-mark-input');
    const max = Number(currentTest.max_marks) || 100;
    const marksValues = Array.from(inputs)
        .map(i => i.value.trim())
        .filter(v => v !== '')
        .map(Number);

    const pctCells = document.querySelectorAll('.pct-cell');
    inputs.forEach((input, idx) => {
        const val = input.value.trim();
        if (pctCells[idx]) {
            pctCells[idx].textContent = val !== '' ? ((Number(val) / max) * 100).toFixed(1) + '%' : '-';
        }
    });

    if (marksValues.length === 0) {
        document.getElementById('statAverage').textContent = '-';
        document.getElementById('statHighest').textContent = '-';
        document.getElementById('statLowest').textContent = '-';
        document.getElementById('statAvgPercent').textContent = '-';
        return;
    }

    const high = Math.max(...marksValues);
    const low = Math.min(...marksValues);
    const avg = marksValues.reduce((a, b) => a + b, 0) / marksValues.length;
    const avgPercent = (avg / max) * 100;

    document.getElementById('statAverage').textContent = avg.toFixed(1);
    document.getElementById('statHighest').textContent = high;
    document.getElementById('statLowest').textContent = low;
    document.getElementById('statAvgPercent').textContent = avgPercent.toFixed(1) + '%';
}

document.getElementById('marksForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btnSaveMarks');
    const status = document.getElementById('marksStatus');
    const inputs = document.querySelectorAll('.student-mark-input');

    const marksPayload = Array.from(inputs)
        .map(i => {
            const row = {
                test_id: testId,
                student_id: i.dataset.studentId,
                marks_obtained: i.value.trim()
            };
            // If we have an existing mark ID, include it for upsert
            if (i.dataset.markId) row.id = i.dataset.markId;
            return row;
        })
        .filter(m => m.marks_obtained !== '');

    if (marksPayload.length === 0) {
        status.textContent = 'Please enter at least one mark.';
        status.className = 'status status--error';
        status.style.display = 'block';
        return;
    }

    btn.disabled = true;
    btn.textContent = 'Saving Marks...';
    status.style.display = 'none';

    try {
        // Upsert handles both new and existing marks
        const response = await api.upsert('marks', marksPayload);

        if (response.success) {
            status.textContent = 'All marks saved successfully!';
            status.className = 'status status--success';
            status.style.display = 'block';

            // Refresh marks to get new IDs
            const refreshRes = await api.get('marks', { test_id: testId });
            if (refreshRes.success) {
                existingMarks = refreshRes.data;
                renderPage();
            }
        } else {
            throw new Error(response.error || 'Failed to save marks.');
        }
    } catch (err) {
        status.textContent = err.message;
        status.className = 'status status--error';
        status.style.display = 'block';
    } finally {
        btn.disabled = false;
        btn.textContent = 'Save All Marks';
    }
});

// Live update summary as teacher types
document.addEventListener('input', (e) => {
    if (e.target.classList.contains('student-mark-input')) {
        updatePerformanceSummary();
    }
});
