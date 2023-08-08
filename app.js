const searchBar = document.querySelector("#searchBar");
const searchBtn = document.querySelector("#search");
const skuInfo = document.querySelector(".ApiContainer");
const skuImg = document.querySelector(".p-img");
const spinner =
  '<div class="lds-ring"><div></div><div></div><div></div><div></div></div>';
const sku = searchBar;

// Aggiungi un event listener per l'evento keyup
searchBar.addEventListener("keydown", function (event) {
  let searchBarValue = searchBar.value;
  if (event.keyCode == 13 && searchBar.value != "") {

    if (!searchBarControl(searchBarValue)) {
      document.querySelector("#searchBar").value = "";
      skuInfo.innerHTML = "";
      alert('please write a valid SKU');
      return;
    }

    //clean the ui and add the slider
    skuInfo.innerHTML = "";
    skuImg.innerHTML = spinner;

    searchBarValue = deleteDuplicates(searchBarValue);
    searchBar.value = searchBarValue;

    searchBarArray = searchBarValue.split(",");
    searchBarValue = searchBarValueConverter(searchBarValue);

    fetch_product(searchBarValue).then((data) => {
      for (let i = 0; i < data.length; i++) {
        console.log(data[i]);

        skuInfo.innerHTML += '<hr class="divider">';
        skuInfo.innerHTML += '<p class="subline">Search result for <b>' + searchBarArray[i] + '</b></p><br>';

        // console.log(data[i]);

        if (data[i].status == "Found") {
          skuInfo.innerHTML += infoTemplate(data[i], i);
        }

        if (data[i].status == "Not found") {
          skuInfo.innerHTML += '<p style="margin-left:2em" class="lead">No Sku Found...</p><br><br>';
        }
      }
    });
  }
});

async function fetch_product(sku) {
  return await $.get("/api2/product/getproductsbysku?skus=" + sku);
}

function searchBarControl(value) {
  const regex = /^[0-9,]+$/;
  return regex.test(value);
}

function deleteDuplicates(searchBarValue) {
  if (searchBarValue.endsWith(",")) { searchBarValue = searchBarValue.replace(',', ''); };
  let searchBarArray = searchBarValue.split(',').map((item) => {
    return item.replace(/^\s+|\s+$/gm, '')
  })
  let optimizedResearch = Array.from(new Set(searchBarArray)).join(',')
  return optimizedResearch;
}

function searchBarValueConverter(searchBarValue) {
  if (!searchBarValue.includes(",")) return searchBarValue;
  return searchBarValue.split(",").join("&skus=");
}

function variantsPaster(sku) {
  let variants = sku.variants;
  let inner = "";
  for (let i = 0; i < Object.keys(variants).length; i++) {
    inner += `
            <div class="p-variant">
            <a href="${variants[i].type !== "Used" ? sku.url : sku.url + "=used"
      }">
      <h3>${variants[i].type}</h3>
      <p class="p-subline">${variants[i].sku}</p>
      <p class="p-subline price">${variants[i].price}€</p>
  </a>
  </div>
  `;
  }
  return inner;
}

function parseText(text) {
  temp = document.createElement("div");
  temp.innerHTML = text;
  return temp.textContent;
}

function releaseChecker(date) {
  date = new Date(date).toLocaleDateString();
  const now = new Date().toLocaleDateString();
  if (now < date) {
    return `${date} <div class="presell">Preorder</div>`;
  } else {
    return date;
  }
}

function checkScreenshots(screenshots,itemNumber) {
  let html = [];
  html[0] = "<ul>";

  screenshots.forEach((screen, idx) => {
    html.push(
      `<a data-fancybox="screenGallery${itemNumber}" data-src=${screen.screenshotMax}><img key="${idx}" src="${screen.screenshotMin}" alt=""></a>`
    );
  });
  html[html.length + 1] = "</ul>";
  html = html.join("");

  return html;
}

function infoTemplate(sku, itemNumber) {
  return `
    <div class="popup"></div>
    <div class="ApiInner p-3">
      <div class="ApiContent d-flex">
          <div class="p-img-container">
              <div class="p-img">
                  <img data-fancybox="screenGallery" src="${sku.packshots[2]
    }" alt="">
              </div>
          </div>
          <div class="p-info">
          <h2 class="p-headline"><a href="${sku.url}">${sku.title}</a></h2>
            <h4 class="p-headline">Release Date: ${new Date(
      sku.release
    ).toLocaleDateString()}</h4>
              <h3 class="p-subline platform">${sku.platform ? sku.platform : ""
    }</h3>
              <p class="p-subline publisher">${sku.publisher ? sku.publisher : ""
    }</p>
              <p class="p-subline genre">${sku.genre ? sku.genre : ""}</p>
                          
              <div class="p-subline p-description">${parseText(
      sku.description || "no description"
    )}</div>
              <hr class="divider">${Object.keys(sku.variants).length > 1
      ? '<h3 class="p-headline">Varianti disponibili</h3>'
      : ""
    }
          <div class="p-variants">
            ${variantsPaster(sku)}
          </div>
      </div>
    </div>
        <div class="p-screenshot">${sku.screenshots ? checkScreenshots(sku.screenshots,itemNumber) : ""
    }</div>
    </div>
    `;
}
