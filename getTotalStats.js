const fs = require('fs');
const exec = require('child_process').exec;

// execute the command git log --author="alexandre.weisser@gmail.com" --oneline --shortstat >git_stats.txt

const cmd = 'git log --author="alexandre.weisser@gmail.com" --oneline --shortstat >git_stats.txt';

exec(cmd, function (error, stdout, stderr) {
    // command output is in stdout
    if (error) {
        console.log(error);
    }
    else {
        console.log(stdout);
    }

    //then read the file and parse it to have the total lines written and deleted by the author
    //using regex to parse the file

    /* example of entries 
        264c1a9 feat(full-game-engine) : is working with win states
    18 files changed, 304 insertions(+), 135 deletions(-)
 */

    fs.readFile('git_stats.txt', 'utf8', function (err, data) {
        if (err) {
            return console.log(err);
        }
        //console.log(data);
        //console.log(typeof data);

        //regex to parse the file
        const regex = /(\d+) files changed, (\d+) insertions\(\+\), (\d+) deletions\(-\)/gm;
        let m;

        let totalFilesChanged = 0;
        let totalInsertions = 0;
        let totalDeletions = 0;

        while ((m = regex.exec(data)) !== null) {
            // This is necessary to avoid infinite loops with zero-width matches
            if (m.index === regex.lastIndex) {
                regex.lastIndex++;
            }

            totalFilesChanged += parseInt(m[1]);
            totalInsertions += parseInt(m[2]);
            totalDeletions += parseInt(m[3]);
        }

        console.log('totalFilesChanged: ', totalFilesChanged);
        console.log('totalInsertions: ', totalInsertions);
        console.log('totalDeletions: ', totalDeletions);

        //remove file
        fs.unlink('git_stats.txt', function (err) {
            if (err) throw err;
            console.log('File deleted!');
        });
    });
});
