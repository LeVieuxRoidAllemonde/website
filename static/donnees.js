/**
NOTE : This script ensures that ensures that the SVG Heatmap-Tonnetz plot is image is updated without reloading the page ; 
that the D3.js plot (note distributions and model curves) is reloaded dynamically ;
that the displayed title of the selected piece is kept "in sync". 
This allows seamless interaction while preserving the user's scroll position and avoiding full page refreshes.
 */



// function to load and render the D3 plot corresponding to a given CSV data file.
function loadD3Plot(url) {
    // Remove any existing SVG / plot content to avoid duplicates
    d3.select("#plot-container").selectAll("*").remove();

    // Fetch the CSV data and pass it to the D3 plotting function
    fetch(url)
        .then(r => r.text())
        .then(csv => drawPlotFromCSV(csv));
}

// function to update all visual elements associated with a musical piece (displayed title, SVG Heatmap-Tonnetz plot, d3.js barplot)
function updatePiece(titleFile, display) {

    // Update the visible title above the plots (if present on the page)
    const selectedTitleEl = document.getElementById("selected-title");
    if (selectedTitleEl && display) {
        selectedTitleEl.textContent = display;
    }

    // Update the SVG heatmap / Tonnetz image
    // A cache-busting query parameter is added to force reload
    const heatmap = document.getElementById("heatmap-img");
    if (heatmap) {
        heatmap.src = `/static/plots/${encodeURIComponent(titleFile)}.svg?cache=${Date.now()}`;
    }

    // Load the corresponding CSV data and redraw the D3 plot
    loadD3Plot(`/data/${encodeURIComponent(titleFile)}`);
}


// Attach click handlers to all piece links in the menu.
document.querySelectorAll(".piece-link").forEach(link => {
    link.addEventListener("click", e => {
        // Prevent default navigation behaviour
        e.preventDefault();

        // Retrieve the filename identifier from data attributes and  display title from the link text 
        const titleFile = link.dataset.titleFile;
        const display   = link.textContent.trim();
        // Safety check: title_file is mandatory for loading data
        if (!titleFile) {
            console.error("title_file manquant", link);
            return;
        }
        // Safety check: title_file is mandatory for loading data
        updatePiece(titleFile, display);
    });
});

//Initialise the page with a default piece when it loads.
//The initial selection is injected by Flask via window.INITIAL_PIECE.
document.addEventListener("DOMContentLoaded", () => {
    if (window.INITIAL_PIECE) {
        updatePiece(
            window.INITIAL_PIECE.title_file,
            window.INITIAL_PIECE.display
        );
    }
});


