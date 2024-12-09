function doGet() {
  Logger.log("doGet executed"); // Debug log to confirm execution
  return HtmlService.createHtmlOutputFromFile("Index"); // Serves the HTML file
}

function getTasksForVolunteer(volunteerName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Master Tasks");
  const data = sheet.getDataRange().getValues();

  Logger.log(`Fetching tasks for volunteer: ${volunteerName}`); // Debug log

  // Filter tasks for the selected volunteer
  return data
    .filter((row, index) => index > 0 && row[0] === volunteerName) // Skip header and match volunteer name
    .map(row => ({
      task: row[1],
      status: row[2] || "Not Started",
      notes: row[3] || "No notes provided.",
      email: row[5] || "", // Include email from Column F
    }));
}


function updateTaskInSheet(taskName, newStatus, newNotes) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Master Tasks");
  const data = sheet.getDataRange().getValues();

  Logger.log(`Updating task: ${taskName}, Status: ${newStatus}, Notes: ${newNotes}`); // Debug log

  // Find and update the task
  data.forEach((row, index) => {
    if (row[1] === taskName) {
      sheet.getRange(index + 1, 3).setValue(newStatus); // Update Status (Column C)
      sheet.getRange(index + 1, 4).setValue(newNotes);  // Update Notes (Column D)
    }
  });
}

function deleteTaskFromSheet(taskName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Master Tasks");
  const data = sheet.getDataRange().getValues();

  Logger.log(`Attempting to delete task: ${taskName}`); // Debug log

  // Loop through the rows to find and delete the task
  for (let i = 1; i < data.length; i++) { // Start at 1 to skip the header row
    if (data[i][1] === taskName) { // Match task name in Column B
      sheet.deleteRow(i + 1); // Delete the row (i + 1 accounts for 0-based index)
      Logger.log(`Task deleted: ${taskName}`);
      return; // Exit the loop after deletion
    }
  }

  Logger.log(`Task not found: ${taskName}`); // If task not found
}

function addTaskToSheet(volunteerName, taskDescription, taskStatus, taskNotes) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const tasksSheet = ss.getSheetByName("Master Tasks");
  const emailSheet = ss.getSheetByName("Volunteer Emails");
  const emailData = emailSheet.getDataRange().getValues();

  // Find the email address for the volunteer
  const email = emailData.find(row => row[0] === volunteerName)?.[1];
  if (!email) {
    Logger.log(`Email not found for volunteer: ${volunteerName}`);
    throw new Error(`Email not found for volunteer: ${volunteerName}`);
  }

  Logger.log(`Adding task: ${taskDescription}, Volunteer: ${volunteerName}, Email: ${email}`);

  // Append the task along with the email address
  tasksSheet.appendRow([volunteerName, taskDescription, taskStatus, taskNotes, new Date(), email]);
}
