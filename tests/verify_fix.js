
// Mock SpreadsheetApp
const SpreadsheetApp = {
  getActiveSpreadsheet: () => ({
    getSheetByName: (name) => ({
      appendRow: (row) => {
        // console.log(`Appending to ${name}:`, row);
        return true;
      }
    })
  })
};

// The function to test (copied from backend/Code.gs)
function handleAddAnnouncement(data) {
  // Input validation
  if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
    return { success: false, error: 'Title is required and must be a non-empty string.' };
  }
  if (data.title.length > 200) {
    return { success: false, error: 'Title must be less than 200 characters.' };
  }

  if (!data.message || typeof data.message !== 'string' || data.message.trim().length === 0) {
    return { success: false, error: 'Message is required and must be a non-empty string.' };
  }
  if (data.message.length > 5000) {
    return { success: false, error: 'Message must be less than 5000 characters.' };
  }

  var targetClass = data.targetClass;
  if (targetClass !== undefined && targetClass !== null && targetClass !== '') {
    if (typeof targetClass !== 'string') {
      return { success: false, error: 'Target class must be a string.' };
    }
    if (targetClass.length > 100) {
      return { success: false, error: 'Target class must be less than 100 characters.' };
    }
  }

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Announcements');
  var date = new Date().toISOString().split('T')[0];
  // Columns: Date, Title, Message, Class
  sheet.appendRow([
    date,
    data.title.trim(),
    data.message.trim(),
    targetClass ? targetClass.trim() : ''
  ]);
  return { success: true };
}

// Test cases
const tests = [
  {
    name: "Valid announcement",
    data: { title: "Hello", message: "World", targetClass: "10th" },
    expected: { success: true }
  },
  {
    name: "Empty title",
    data: { title: "", message: "World", targetClass: "10th" },
    expected: { success: false, error: 'Title is required and must be a non-empty string.' }
  },
  {
    name: "Missing title",
    data: { message: "World", targetClass: "10th" },
    expected: { success: false, error: 'Title is required and must be a non-empty string.' }
  },
  {
    name: "Title too long",
    data: { title: "a".repeat(201), message: "World", targetClass: "10th" },
    expected: { success: false, error: 'Title must be less than 200 characters.' }
  },
  {
    name: "Empty message",
    data: { title: "Hello", message: "   ", targetClass: "10th" },
    expected: { success: false, error: 'Message is required and must be a non-empty string.' }
  },
  {
    name: "Message too long",
    data: { title: "Hello", message: "a".repeat(5001), targetClass: "10th" },
    expected: { success: false, error: 'Message must be less than 5000 characters.' }
  },
  {
    name: "Invalid targetClass type",
    data: { title: "Hello", message: "World", targetClass: 123 },
    expected: { success: false, error: 'Target class must be a string.' }
  },
  {
    name: "TargetClass too long",
    data: { title: "Hello", message: "World", targetClass: "a".repeat(101) },
    expected: { success: false, error: 'Target class must be less than 100 characters.' }
  },
  {
    name: "Valid announcement without targetClass",
    data: { title: "Hello", message: "World" },
    expected: { success: true }
  },
  {
    name: "Valid announcement with empty string targetClass",
    data: { title: "Hello", message: "World", targetClass: "" },
    expected: { success: true }
  }
];

let failed = 0;
tests.forEach(t => {
  const result = handleAddAnnouncement(t.data);
  if (JSON.stringify(result) === JSON.stringify(t.expected)) {
    console.log(`✅ PASS: ${t.name}`);
  } else {
    console.log(`❌ FAIL: ${t.name}`);
    console.log(`   Expected: ${JSON.stringify(t.expected)}`);
    console.log(`   Actual:   ${JSON.stringify(result)}`);
    failed++;
  }
});

if (failed > 0) {
  process.exit(1);
} else {
  console.log("\nAll tests passed!");
}
