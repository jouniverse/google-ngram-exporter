document.getElementById("exportBtn").addEventListener("click", async () => {
  // Get the active tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // Request data from content script
  chrome.tabs.sendMessage(tab.id, { action: "getData" }, (response) => {
    if (!response || !response.data) {
      alert("No ngram data found on this page");
      return;
    }

    // Convert data to CSV
    const csvRows = ["year,phrase,frequency"];
    for (const row of response.data) {
      csvRows.push(`${row.year},"${row.phrase}",${row.frequency}`);
    }
    const csvContent = csvRows.join("\n");

    // Get the query phrase for the filename
    const urlParams = new URL(tab.url).searchParams;
    const content = urlParams.get("content") || "ngram";
    const filename = `${content.replace(/[^a-z0-9]/gi, "_")}_frequencies.csv`;

    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    chrome.downloads.download({
      url: url,
      filename: filename,
      saveAs: true,
    });
  });
});
