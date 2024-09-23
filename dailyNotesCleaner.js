// Daily Notes Cleaner!!! (Stuff that I need for my Obsidian lol)

const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, 'config.json');                // Get the config file
const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));   // Parsing the JSON data

const underDate = configData.underDate                                // underDate is the date creation limit of pages being deleted, anything bellow it will be removed
const dailyNotesPath = configData.dailyNotesPath




main() // Ayyyy its running!!!!


function main() {
    ReadTheMainDir()
    .then(results => {
        console.log(results); // Log files to be deleted
        return RemoveFiles(results); // Call RemoveFiles with the results
    })
    .then(deleteMessage => console.log(deleteMessage)) // Log the success message
    .catch(err => console.error(err));
}


function ReadTheMainDir() {
    return new Promise((resolve, reject) => {
        fs.readdir(dailyNotesPath, (err, files) => {
            if (err) {
                return reject('Error reading directory: ' + err);
            }

            let underDateValue = new Date(GetDateSpan());            // Needs to be of Date type for the comparisons to work
            let resultArray = [];

            files.forEach(file => {
                const fileDate = tryParseDate(file.slice(0, -3));
                if (fileDate != null && fileDate < underDateValue) {
                    resultArray.push(file);
                }
            });
            resolve(resultArray);                                   // Resolve the array once all operations are done
        });
    });
}

function RemoveFiles(resultArray) {
    return new Promise((resolve, reject) => {
        let deletePromises = resultArray.map(file => {
            return new Promise((fileResolve, fileReject) => {
                const filePath = path.join(dailyNotesPath, file);
                fs.unlink(filePath, (err) => {
                    if (err) {
                        console.error(`Error deleting file: ${file}`, err);
                        fileReject(err);
                    } else {
                        console.log(`Deleted file: ${file}`);
                        fileResolve();
                    }
                });
            });
        });

        Promise.all(deletePromises)
            .then(() => resolve(`Deleted ${deletePromises.length} files.`))
            .catch(reject);
    });
}

function GetDateSpan() {
    let mainDate = new Date(); // Ensure mainDate is initialized to the current date
    switch (underDate) {
        case 'month': // In case 'month' is in the JSON
            mainDate.setMonth(mainDate.getMonth() - 1);
            return mainDate.toISOString().split('T')[0];

        case 'week': // In case 'week' is in the JSON
            mainDate.setDate(mainDate.getDate() - 7);
            return mainDate.toISOString().split('T')[0];

        case 'day': // In case 'day' is in the JSON
            mainDate.setDate(mainDate.getDate() - 1);
            return mainDate.toISOString().split('T')[0];

        default: // In case it is of Date type
            if (tryParseDate(underDate)) {
                return new Date(underDate).toISOString().split('T')[0]; // Ensure to return a Date object
            } else {
                return null;
            }
    }
}

function tryParseDate(dateString) { // Try-parse function for ISO dates
    let date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
}
  