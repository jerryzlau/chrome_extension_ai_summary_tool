/* global chrome */

import React from 'react';
import './GetSummary.css';

async function getSummary(prompt, webContent) {
  try {
    const response = await fetch('http://localhost:3000/get_summary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt, webContent })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching summary:', error);
    throw error;
  }
}

const getwebContent = async () => {
  return new Promise((resolve, reject) => {
    if (chrome && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            function: () => document.body.innerText,
          }, (results) => {
            if (results && results[0] && results[0].result) {
              const webContent = results[0].result;

              resolve(webContent);
            }
          });
        });
      });

    } else {
      reject("Chrome APIs are not available. Are you running in an extension context?");
    }
  });
}

function GetSummary() {
  const [summary, setSummary] = React.useState();
  const [prompt, setPrompt] = React.useState();
  const [loading, setLoading] = React.useState(false);

  const handleClick = async () => {
    setLoading(true);
    const webContent = await getwebContent();
    const summary = await getSummary(prompt, webContent);

    setSummary(summary.result);
    setLoading(false);
  };


  const renderPrompt = () => {
    return (
      <>
        <form onSubmit={handleClick}>
          <textarea
            value={prompt}
            onChange={e => {
              setPrompt(e.target.value)
            }}
          />  
          <button onClick={handleClick}>Send!</button>
        </form>
      </>
    )
  };

  const renderContent = () => {
    return summary ? <div dangerouslySetInnerHTML={{ __html: summary }} /> : renderPrompt();
  }

  return (
    <div className='GetSummary'>
      <p>Hello! Welcome to web summary! Input what you want to ask about this webpage below and click send to get a summary!</p> 
      {
        loading ? <div className="loader" /> : renderContent()
      }
    </div>
  );
}

export default GetSummary;

