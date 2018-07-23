import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

class App extends React.Component {

  state = {}

  componentDidMount() {
    axios
      .get('/api/data')
      .then(res => {
        this.setState({ ...res.data });
      });
  }

  render() {
    return (
      <div>
        <h1>Alitu Code Test</h1>
        <ul>
          <li>Total Number of Episodes Created: {this.state.episodesCreated}</li>
          <li>Total Number of Episodes from the last week: {this.state.lastWeekEpisodes}</li>
          <li>Total Number of Files Uploaded: {this.state.filesUploaded}</li>
          <li>Number of files uploaded in the last week: {this.state.lastWeekFiles}</li>
          <li>Average file size uploaded over last 7 days: {this.state.lastWeekFileSize}</li>
          <li>Average file size uploaded over last 30 days: {this.state.last30DaysFileSize}</li>
          <li>Average recordings per episode over the last 7 days: {this.state.lastWeekAverageRecordings}</li>
          <li>Average recordings per episode over the last 30 days: {this.state.last30DaysAverageRecordings}</li>
        </ul>
      </div>
    );
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
