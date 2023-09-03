const secretfileVersion = 1; // Version of the secretfile format
const appVersion = "1.1"; // Version of the app

let entryCounter = 0;

function updateEditor() {
  document.querySelectorAll(".alertEmpty").forEach((alert) => {
    if (entryCounter === 0) {
      alert.style.display = "block";
    } else {
      alert.style.display = "none";
    }
  });
  const fileLoadInput = document.getElementById("secretfile-load-file");
  fileLoadInput.value = "";
}

function clearInputs() {
  document.querySelectorAll("input").forEach((input) => {
    input.value = "";
  });
}

function clearSecretfile() {
  swal
    .fire({
      title: "Are you sure?",
      text: "This will clear delete all entries from the currently open secretfile!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, clear it!",
      confirmButtonColor: "#d33",
    })
    .then((result) => {
      if (result.isConfirmed) {
        clearAllEntries();
        swal.fire({
          icon: "success",
          title: "File Cleared!",
          text: "The currenty open file has been cleared.",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          toast: true,
          position: "bottom-start",
        });
      }
    });
  updateEditor();
}

function addEntry(entry, passphrase) {
  // This function adds a new entry to the editor. If an entry is passed, it will be used to populate the fields.
  // If a passphrase is passed, it will be used to decrypt the sensitive data of the entry.
  entryCounter++;
  let accountName = entry
    ? passphrase
      ? decryptString(entry.accountName, passphrase)
      : entry.accountName
    : "";
  let accountLogin = entry
    ? passphrase
      ? decryptString(entry.accountLogin, passphrase)
      : entry.accountLogin
    : "";
  let otpSecret = entry
    ? passphrase
      ? decryptString(entry.otpSecret, passphrase)
      : entry.otpSecret
    : "";
  let otpDigits = entry ? entry.otpDigits : 6;
  let otpTime = entry ? entry.otpTime : 30;
  let newEditorEntry = document.createElement("div");
  newEditorEntry.className = "secretfileEditorEntry";
  newEditorEntry.id = `secretfileEditorEntry-${entryCounter}`;
  newEditorEntry.innerHTML = `
        <div class="card entry">
            <h3 class="card-header">Entry ${entryCounter}</h3>
            <div class ="form-group card-body">
              <label for="secretfileEditorEntry-name">Account Name <i class="fa-solid fa-circle-question help" onclick="showHelp('accountName')"></i></label>
              <input type="text" class="form-control" id="secretfileEditorEntry-accountName" placeholder="Google Account" value="${accountName}">
              
              <label for="secretfileEditorEntry-login">Login/Email Address <i class="fa-solid fa-circle-question help" onclick="showHelp('accountLogin')"></i></label>
              <input type="text" class="form-control" id="secretfileEditorEntry-accountLogin" placeholder="example@example.com" value="${accountLogin}">
              <label for="secretfileEditorEntry-secret">Secret <i class="fa-solid fa-circle-question help" onclick="showHelp('otpSecret')"></i></label>
              <input type="text" class="form-control" id="secretfileEditorEntry-otpSecret" placeholder="JBSWY3DPEHPK3PXP" value="${otpSecret}">
              <label for="secretfileEditorEntry-otpDigits">Number of digits <i class="fa-solid fa-circle-question help" onclick="showHelp('otpDigits')"></i></label>
              <input type="number" class="form-control" id="secretfileEditorEntry-otpDigits" placeholder="6" value="${otpDigits}">
              <label for="secretfileEditorEntry-otpTime">OTP expiry time (In seconds) <i class="fa-solid fa-circle-question help" onclick="showHelp('otpTime')"></i></label>
              <input type="number" class="form-control" id="secretfileEditorEntry-otpTime" placeholder="30" value="${otpTime}">
              <br>
              <button class="btn btn-danger entry-delete" onclick="deleteEntry(${entryCounter})"><i class="fa-solid fa-trash-can"></i> Delete entry</button>
              <button class="btn btn-primary" onclick="verifyEntry(${entryCounter})"><i class="fa-solid fa-key"></i> Generate OTP</button>
            </div>
        </div>
        `;
  document.getElementById("editor-entries").appendChild(newEditorEntry);
  updateEditor();
}

function addEntryToViewer(entry, passphrase) {
  let accountName = entry
    ? passphrase
      ? decryptString(entry.accountName, passphrase)
      : entry.accountName
    : "";
  let accountLogin = entry
    ? passphrase
      ? decryptString(entry.accountLogin, passphrase)
      : entry.accountLogin
    : "";
  let otpSecret = entry
    ? passphrase
      ? decryptString(entry.otpSecret, passphrase)
      : entry.otpSecret
    : "";
  let otpDigits = entry ? entry.otpDigits : 6;
  let otpTime = entry ? entry.otpTime : 30;
  let otpAuthURI = `otpauth://totp/${accountName}:${accountLogin}?secret=${otpSecret}&digits=${otpDigits}&period=${otpTime}`;
  let newViewerEntry = document.createElement("div");
  newViewerEntry.className = "secretfileViewerEntry";
  newViewerEntry.id = `secretfileViewerEntry-${entryCounter}`;
  newViewerEntry.innerHTML = `
    <div class="card entry">
      <h3 class="card-header">Entry ${entryCounter}</h3>
      <div class="card-body row align-items-start">
        <div class="col">
        <div class="print-show" style="margin-top:20px;"></div>
          <p><b>Account Name:</b> ${accountName} <a class="copyBtn" onclick="copyToClip('${accountName}')"><i class="fa-solid fa-copy fa-fw"></i></a></p>
          <p><b>Login/Email Address:</b> ${accountLogin} <a class="copyBtn" onclick="copyToClip('${accountLogin}')"><i class="fa-solid fa-copy fa-fw"></i></a></p>
          <p><b>Secret:</b> ${otpSecret} <a class="copyBtn" onclick="copyToClip('${otpSecret}')"><i class="fa-solid fa-copy fa-fw"></i></a></p>
          <p><b>Number of digits:</b> ${otpDigits} <a class="copyBtn" onclick="copyToClip('${otpDigits}')"><i class="fa-solid fa-copy fa-fw"></i></a></p>
          <p><b>OTP expiry time (In seconds):</b> ${otpTime} <a class="copyBtn" onclick="copyToClip('${otpTime}')"><i class="fa-solid fa-copy fa-fw"></i></a></p>
          <button class="btn btn-primary" onclick="verifyEntry(${entryCounter})"><i class="fa-solid fa-key"></i> Generate OTP</button>
        </div>
        <div class="col text-end">
          <div class="qrcode float-end"></div>
        </div>
      </div>
    </div>
  `;
  let qrcode = new QRCode(newViewerEntry.querySelector(".qrcode"), {
    text: otpAuthURI,
    width: 256,
    height: 256,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.L,
  });
  document.getElementById("viewer-entries").appendChild(newViewerEntry);
}

function verifyEntry(entryId) {
  // Verifies fields of the entry and generates an OTP if everything is correct
  let entry = document.querySelector(`#secretfileEditorEntry-${entryId}`);
  let otpSecret = entry.querySelector(`#secretfileEditorEntry-otpSecret`).value;
  let otpDigits = entry.querySelector(`#secretfileEditorEntry-otpDigits`).value;
  let otpTime = entry.querySelector(`#secretfileEditorEntry-otpTime`).value;
  if (!otpSecret || !otpDigits || !otpTime) {
    Swal.fire({
      title: "Missing settings!",
      text: "Make sure all required fields are filled out",
      icon: "error",
      confirmButtonText: "Close",
    });
    return;
  }
  try {
    let totp = new jsOTP.totp(otpTime, otpDigits);
    let generatedOTP = totp.getOtp(otpSecret);
    Swal.fire({
      title: "Here's your OTP",
      text: `OTP: ${generatedOTP}`,
      icon: "success",
      footer:
        "Compare this OTP with your authenticator app. If the OTP doesn't match, make sure your configuration is correct and your system time is accurate.",
      confirmButtonText: "Close",
    });
  } catch (e) {
    Swal.fire({
      title: "Something went wrong!",
      text: e,
      icon: "error",
      confirmButtonText: "Close",
    });
  }
}

function deleteEntry(entryId) {
  // Deletes an entry from the editor and updates the IDs of the remaining entries
  const entries = document.getElementById("editor-entries");
  let entry = document.getElementById(`secretfileEditorEntry-${entryId}`);
  entry.remove();
  entryCounter--;
  entries.querySelectorAll(".secretfileEditorEntry").forEach((entry, i) => {
    entry.id = `secretfileEditorEntry-${i + 1}`;
    entry.querySelector("h3").innerHTML = `Entry ${i + 1}`;
    entry
      .querySelector(".entry-delete")
      .setAttribute("onclick", `deleteEntry(${i + 1})`);
  });
  updateEditor();
}

function loadFile() {
  // Clear viewer and editor entries
  document.querySelectorAll(".secretfileEditorEntry").forEach((entry) => {
    entry.remove();
    entryCounter--;
  });
  document.querySelectorAll(".secretfileViewerEntry").forEach((entry) => {
    entry.remove();
  });
  // Load a secretfile from a file input and check file format
  let file = document.getElementById("secretfile-load-file").files[0];
  if (
    file.name.split(".").pop() != "json" &&
    file.name.split(".").pop() != "secretfile"
  ) {
    swal.fire({
      icon: "error",
      title: "Invalid Secretfile",
      text: "Please select a valid .secretfile.json file",
    });
    return;
  }

  let reader = new FileReader();
  reader.readAsText(file, "UTF-8");
  reader.onload = (readerEvent) => {
    // Parse the file, and check if it's data is encrypted
    let fileContent = JSON.parse(readerEvent.target.result);
    let isEncrypted = fileContent.encrypted;
    let passphrase;
    if (isEncrypted) {
      passphrase = document.getElementById("secretfile-load-passphrase").value;
    }
    let entries = fileContent.entries;
    // Enumerate through the entries and add them to the editor using addEntry()
    // If the file is not encrypted, passphrase is undefined and ignored by addEntry()
    try {
      entries.forEach((entry) => {
        addEntry(entry, passphrase);
      });
      swal.fire({
        icon: "success",
        title: "Success!",
        text: "Secretfile loaded successfully!",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        toast: true,
        position: "bottom-start",
      });
    } catch (e) {
      swal.fire({
        icon: "error",
        title: "Failed to load secretfile",
        text: "The passphrase you entered is incorrect, or the secretfile is corrupted. Please make sure you entered the correct passphrase and try again.",
      });
    }
  };
  updateEditor();
}

function loadFileToViewer() {

  clearAllEntries();

  let file = document.getElementById("secretfile-view-file").files[0];
  if (
    file.name.split(".").pop() != "json" &&
    file.name.split(".").pop() != "secretfile"
  ) {
    swal.fire({
      icon: "error",
      title: "Invalid Secretfile",
      text: "Please select a valid .secretfile.json file",
    });
    return;
  }

  let reader = new FileReader();
  reader.readAsText(file, "UTF-8");
  reader.onload = (readerEvent) => {
    // Parse the file, and check if it's data is encrypted
    let fileContent = JSON.parse(readerEvent.target.result);
    let isEncrypted = fileContent.encrypted;
    let passphrase;
    if (isEncrypted) {
      passphrase = document.getElementById("secretfile-view-passphrase").value;
    }
    let entries = fileContent.entries;
    // Enumerate through the entries and add them to the editor using addEntry()
    // If the file is not encrypted, passphrase is undefined and ignored by addEntry()
    try {
      entries.forEach((entry) => {
        addEntry(entry, passphrase);
        addEntryToViewer(entry, passphrase);
      });
      swal.fire({
        icon: "success",
        title: "Success!",
        text: "Secretfile loaded successfully!",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        toast: true,
        position: "bottom-start",
      });
    } catch (e) {
      swal.fire({
        icon: "error",
        title: "Failed to load secretfile",
        text: "The passphrase you entered is incorrect, or the secretfile is corrupted. Please make sure you entered the correct passphrase and try again.",
      });
    }
  };
  updateEditor();
}

function saveFile() {
  let passphrase = document.getElementById("secretfile-save-passphrase").value;
  let entries = document.getElementById("editor-entries");
  if (!passphrase) {
    swal
      .fire({
        icon: "warning",
        title: "Are you sure?",
        text: "You haven't entered an encryption passphrase. This means your secretfile will be saved in plain text! Are you sure you want to continue?",
        showCancelButton: true,
        confirmButtonText: "Yes, save in plain text",
        cancelButtonText: "No, cancel",
      })
      .then((result) => {
        if (result.isConfirmed) {
          generateFileContent(entries);
        }
      });
  } else {
    generateFileContent(entries, passphrase);
  }
}

function generateFileContent(entries, passphrase) {
  try {
    let secretFileContent = `{
  "version": ${secretfileVersion},
  "encrypted": ${passphrase ? true : false},
  "entries": [`;
    entries.querySelectorAll(".secretfileEditorEntry").forEach((entry, i) => {
      secretFileContent += `
    {
      "entryId": ${i + 1},
      "accountName": "${
        passphrase
          ? encryptString(
              entry.querySelector(`#secretfileEditorEntry-accountName`).value,
              passphrase
            )
          : entry.querySelector(`#secretfileEditorEntry-accountName`).value
      }",
      "accountLogin": "${
        passphrase
          ? encryptString(
              entry.querySelector(`#secretfileEditorEntry-accountLogin`).value,
              passphrase
            )
          : entry.querySelector(`#secretfileEditorEntry-accountLogin`).value
      }",
      "otpSecret": "${
        passphrase
          ? encryptString(
              entry.querySelector(`#secretfileEditorEntry-otpSecret`).value,
              passphrase
            )
          : entry.querySelector(`#secretfileEditorEntry-otpSecret`).value
      }",
      "otpDigits": ${
        entry.querySelector(`#secretfileEditorEntry-otpDigits`).value
      },
      "otpTime": ${entry.querySelector(`#secretfileEditorEntry-otpTime`).value}
    }`;
      if (i !== entries.querySelectorAll(".secretfileEditorEntry").length - 1) {
        secretFileContent += `,`;
      }
    });

    secretFileContent += `
  ]
}`;
    let filename = document.getElementById("secretfile-save-filename").value;
    downloadFile(
      secretFileContent,
      `${filename}.secretfile.json`,
      "application/json"
    );
    swal.fire({
      icon: "success",
      title: "Success!",
      text: "Secretfile saved successfully!",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      toast: true,
      position: "bottom-start",
    });
  } catch (e) {
    Swal.fire({
      title: "Something went wrong!",
      text: e,
      icon: "error",
      confirmButtonText: "Close",
    });
    console.error("An error occured: " + e);
  }
}

function encryptString(string, passphrase) {
  let output = CryptoJS.AES.encrypt(string, passphrase);
  return output.toString();
}

function decryptString(string, passphrase) {
  let output = CryptoJS.AES.decrypt(string, passphrase);
  return output.toString(CryptoJS.enc.Utf8);
}

function downloadFile(data, filename, type) {
  let file = new Blob([data], {
    type: type,
  });
  if (window.navigator.msSaveOrOpenBlob)
    window.navigator.msSaveOrOpenBlob(file, filename);
  else {
    let a = document.createElement("a");
    let url = URL.createObjectURL(file);
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 0);
  }
}

function copyToClip(string) {
  navigator.clipboard.writeText(string).then(
    function () {
      swal.fire({
        icon: "success",
        title: "Copied!",
        text: "Data copied to clipboard!",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        toast: true,
        position: "bottom-start",
      });
    },
    function (err) {
      console.error("Error: Could not copy text: ", err);
      Swal.fire({
        title: "Something went wrong!",
        text: err,
        icon: "error",
        confirmButtonText: "Close",
      });
    }
  );
}
    
function clearAllEntries() {
    document.querySelectorAll(".secretfileEditorEntry").forEach((entry) => {
      entry.remove();
      entryCounter--;
    });
    document.querySelectorAll(".secretfileViewerEntry").forEach((entry) => {
      entry.remove();
    });
    updateEditor();
}

function showHelp(helpId) {
  let defaultHelpIcon = "info";
  let defaultHelpConfirmText = "Close";

  switch (helpId) {
    case "accountName":
      Swal.fire({
        title: "Account Name",
        text: "The name of the account. This is used to identify the account provider (e.g. Google or Facebook).",
        icon: defaultHelpIcon,
        confirmButtonText: defaultHelpConfirmText,
      });
      break;
    case "accountLogin":
      Swal.fire({
        title: "Login/Email Address",
        text: "The login or email address associated with the account. This is used to identify the exact account for which the OTP will be generated.",
        icon: defaultHelpIcon,
        confirmButtonText: defaultHelpConfirmText,
      });
      break;
    case "otpSecret":
      Swal.fire({
        title: "Secret",
        text: "The secret value used to generate the OTP. This is usually a string of random characters.",
        icon: defaultHelpIcon,
        confirmButtonText: defaultHelpConfirmText,
      });
      break;
    case "otpDigits":
      Swal.fire({
        title: "Number of digits",
        text: "The number of digits in the generated OTP. This is usually 6, or (in rare cases) 8. If you are unsure, leave this at the default value.",
        icon: defaultHelpIcon,
        confirmButtonText: defaultHelpConfirmText,
      });
      break;
    case "otpTime":
      Swal.fire({
        title: "OTP expiry time",
        text: "The time in seconds for which the OTP will be valid. This is usually 30. If you are unsure, leave this at the default value.",
        icon: defaultHelpIcon,
        confirmButtonText: defaultHelpConfirmText,
      });
      break;
    default:
      showErrorMessage("invalidHelpId", helpId);
      break;
  }
}

function showErrorMessage(errorId, errorData) {
  let defaultErrorIcon = "error";
  let defaultErrorCancelText = "Close";
  let defaultErrorConfirmText = "Report issue";
  let defaultBugtrackerLink =
    "https://github.com/hexandcube/secretfile-editor/issues/new";

  switch (errorId) {
    case "invalidHelpId":
      Swal.fire({
        title: "Something went wrong!",
        text: "A help box with the specified ID could not be found. Please report this issue on GitHub.",
        icon: defaultErrorIcon,
        footer: `HelpId: ${errorData}`,
        showCancelButton: true,
        cancelButtonText: defaultErrorCancelText,
        confirmButtonText: defaultErrorConfirmText,
        focusCancel: true,
      }).then((result) => {
        if (result.isConfirmed) {
          window.open(defaultBugtrackerLink);
        }
      });
      break;
    default:
      Swal.fire({
        title: "Something went wrong!",
        text: "An unknown error occured. Please report this issue on GitHub.",
        icon: defaultErrorIcon,
        footer: `ErrorId: ${errorId}, ErrorData: ${errorData}`,
        showCancelButton: true,
        cancelButtonText: defaultErrorCancelText,
        confirmButtonText: defaultErrorConfirmText,
        focusCancel: true,
      }).then((result) => {
        if (result.isConfirmed) {
          window.open(defaultBugtrackerLink);
        }
      });
      break;
  }
}

window.onload = function () {
  document.getElementById("secretfile-load-file").onchange = function (e) {
    // Check if the file selected by the user is encrypted, and if so, show the passphrase input
    let file = e.target.files[0];
    let reader = new FileReader();
    reader.readAsText(file, "UTF-8");

    reader.onload = (readerEvent) => {
      let fileContent = readerEvent.target.result;
      if (JSON.parse(fileContent).encrypted) {
        document
          .getElementById("secretfile-load-passphrase-div")
          .classList.remove("hidden");
      } else {
        document
          .getElementById("secretfile-load-passphrase-div")
          .classList.add("hidden");
      }
      // Enable the load button once the user has selected a file
      document
        .getElementById("secretfile-load-confirmbtn")
        .classList.remove("disabled");
    };
  };
  document.getElementById("secretfile-view-file").onchange = function (e) {
    // Check if the file selected by the user is encrypted, and if so, show the passphrase input
    let file = e.target.files[0];
    let reader = new FileReader();
    reader.readAsText(file, "UTF-8");

    reader.onload = (readerEvent) => {
      let fileContent = readerEvent.target.result;
      if (JSON.parse(fileContent).encrypted) {
        document
          .getElementById("secretfile-view-passphrase-div")
          .classList.remove("hidden");
      } else {
        document
          .getElementById("secretfile-view-passphrase-div")
          .classList.add("hidden");
      }
      // Enable the load button once the user has selected a file
      document
        .getElementById("secretfile-view-confirmbtn")
        .classList.remove("disabled");
    };
  };
  document.getElementById("version").innerHTML = `v${appVersion}`;
  clearInputs();
  updateEditor();
};
