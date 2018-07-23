const express = require('express');
const app = express();
const port = process.env.PORT || 4000;
const bodyParser = require('body-parser');
const router = require('express').Router();
const moment = require('moment');
var mysql = require('promise-mysql');

app.use(express.static(`${__dirname}/public`));

router.route('/data')
  .get((req, res) => {

    const resultingOutput = {};

    let dbsettings = null;
    if (process.env.JAWSDB_URL) {
      dbsettings = {
        multipleStatements: true,
        host: 'wftuqljwesiffol6.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
        user: 'g4hxdbo0grw4z5gu',
        password: 'mjnq5p9jju02okdl',
        database: 'ub5bab81bp97lzm2'
      };
    } else {
      dbsettings = {
        multipleStatements: true,
        host: 'localhost',
        user: 'root',
        password: 'password',
        database: 'alitu'
      };
    }

    mysql.createConnection(dbsettings).then(connection => {
      connection.query('SELECT * FROM episodes; SELECT * FROM files;', (error, results) => {
        if (error) throw error;

        // I've used moment.js throughout to calculate anything that's date-related.

        // Total number of episodes created
        resultingOutput.episodesCreated = results[0].length;

        // Number of episodes created in the last week
        resultingOutput.lastWeekEpisodes = results[0].filter(episode => {
          if (moment(episode.created_at).isAfter(moment().subtract(1, 'w'))) {
            return episode;
          }
        }).length;

        // total number of files uploaded
        resultingOutput.filesUploaded = results[1].length;

        // number of files uploaded in the last week
        resultingOutput.lastWeekFiles = results[1].filter(file => {
          if (moment(file.created_at).isAfter(moment().subtract(1, 'w'))) {
            return file;
          }
        }).length;

        // average file size uploaded over last 7 days
        let lastWeekTotalFileSize = 0;
        results[1]
          .filter(file => {
            if (moment(file.created_at).isAfter(moment().subtract(1, 'w'))) {
              return file;
            }
          })
          .map(file => {
            try {
              lastWeekTotalFileSize += Number(JSON.parse(file.codecInformation).format.size);
            } catch (error) {
              // console.log('That file has an invalid JSON string: ', error);
            }
          });
        resultingOutput.lastWeekFileSize = Math.round(lastWeekTotalFileSize / resultingOutput.lastWeekFiles) / 1000000 + ' MB';

        // average file size uploaded over last 30 days
        let last30DaysTotalFileSize = 0;
        const last30DaysFiles = results[1]
          .filter(file => {
            if (moment(file.created_at).isAfter(moment().subtract(30, 'd'))) {
              return file;
            }
          }).length;

        results[1]
          .filter(file => {
            if (moment(file.created_at).isAfter(moment().subtract(30, 'd'))) {
              return file;
            }
          })
          .map(file => {
            try {
              last30DaysTotalFileSize += Number(JSON.parse(file.codecInformation).format.size);
            } catch (error) {
              // console.log('That file has an invalid JSON string: ', error);
            }
          });
        resultingOutput.last30DaysFileSize = Math.round(last30DaysTotalFileSize / last30DaysFiles) / 1000000 + ' MB';

        // average number of recordings per episode over last 7 days
        let lastWeekTotalRecordings = 0;
        results[0]
          .filter(episode => {
            if (moment(episode.created_at).isAfter(moment().subtract(30, 'd'))) {
              return episode;
            }
          })
          .map(episode => {
            lastWeekTotalRecordings += JSON.parse(episode.schema).timeline.length;
          });
        resultingOutput.lastWeekAverageRecordings = Math.round(lastWeekTotalRecordings / resultingOutput.lastWeekFiles * 100) / 100;

        // average number of recordings per episode over the last 30 days
        const last30DaysTotalEpisodes = results[0]
          .filter(episode => {
            if (moment(episode.created_at).isAfter(moment().subtract(30, 'd'))) {
              return episode;
            }
          }).length;

        let last30DaysTotalRecordings = 0;
        results[0]
          .filter(episode => {
            if (moment(episode.created_at).isAfter(moment().subtract(30, 'd'))) {
              return episode;
            }
          })
          .map(episode => {
            last30DaysTotalRecordings += JSON.parse(episode.schema).timeline.length;
          });
        resultingOutput.last30DaysAverageRecordings = Math.round(last30DaysTotalRecordings / last30DaysTotalEpisodes * 100) / 100;

        return res.json(resultingOutput);
      });
    });
  });

app.use(express.static(`${__dirname}/public`));
app.use(bodyParser.json());
app.use('/api', router);
app.get('/*', (req, res) => res.sendFile(`${__dirname}/public/index.html`));

app.listen(port, () => console.log(`Express running on port ${port}`));

module.exports = app;
