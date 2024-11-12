console.log("Ngram CSV Exporter content script loaded");

function extractNgramData() {
  console.log("Attempting to extract ngram data...");

  // Find the data element
  const ngramsDataElement = document.getElementById("ngrams-data");
  console.log("Ngrams data element found:", ngramsDataElement);

  if (!ngramsDataElement) {
    return null;
  }

  try {
    // Parse the data from the element
    const ngramData = JSON.parse(ngramsDataElement.textContent);
    console.log("Parsed ngram data:", ngramData);

    if (!ngramData || !Array.isArray(ngramData)) {
      return null;
    }

    // Get year range from the script content
    const scripts = document.getElementsByTagName("script");
    let yearStart = 1800;
    let yearEnd = 2019;

    for (const script of scripts) {
      const content = script.textContent || "";
      if (content.includes("drawD3Chart")) {
        const match = content.match(/drawD3Chart\([^,]+,\s*(\d+),\s*(\d+)/);
        if (match) {
          yearStart = parseInt(match[1]);
          yearEnd = parseInt(match[2]);
          break;
        }
      }
    }

    // Process the data into CSV format
    const results = [];
    for (const series of ngramData) {
      const phrase = series.ngram;
      const frequencies = series.timeseries;

      // Create year-frequency pairs
      for (let i = 0; i < frequencies.length; i++) {
        const year = yearStart + i;
        if (year <= yearEnd) {
          results.push({
            phrase,
            year,
            frequency: frequencies[i],
          });
        }
      }
    }

    console.log("Processed results:", results);
    return results;
  } catch (error) {
    console.error("Error in data extraction:", error);
    return null;
  }
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getData") {
    console.log("Received getData request");
    const data = extractNgramData();
    console.log("Extracted data:", data);
    sendResponse({ data });
  }
  return true;
});
