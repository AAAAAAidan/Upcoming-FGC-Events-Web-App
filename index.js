/**
 * Requires a given value to be defined and not set to falue or an empty string.
 * @param {Object} value - The value to be required.
 * @param {String} errorMessage - The message to throw if the condition fails.
 */
function requireValue(value, errorMessage) {
  if (!value) {
    throw new Error(errorMessage)
  }
}

/**
 * Fetches a JSON object from a URL GET response.
 * @param {String} url - The request URL.
 * @returns {Object} Returns the JSON object.
 */
async function fetchJson(url) {
  console.log("GET", url)
  requireValue(url, "URL cannot be null or undefined")
  const response = await fetch(url)
  const json = await response.json()
  requireValue(json, "No data found from URL: " + url)
  console.log("JSON", json)
  return json
}

/**
 * Creates a div element containing event data.
 * @param {Array[String]} data - Values: [date, title, URL, address, games].
 * @returns {Element} Returns a div element.
 */
function buildEventElement(data) {
  // Set up the data
  requireValue(data, "Data cannot be null or undefined")
  requireValue(data.length >= 4, "Four or more data values must be provided.")
  const dateString = data[0]
  const title = data[1].toUpperCase()
  const url = data[2]
  const address = data[3].toUpperCase()
  const games = data[4].toUpperCase()
  requireValue(dateString, "Date (data index 0) cannot be null or undefined")
  requireValue(url, "URL (data index 2) cannot be null or undefined")
  requireValue(address, "Address (data index 3) cannot be null or undefined")
  requireValue(games, "Games (data index 4) cannot be null or undefined")
  requireValue(address, "Address (data index 3) cannot be null or undefined")

  // Set up the
  const locale = navigator.languages ? navigator.languages[0] : navigator.language
  const date = new Date(dateString)
  const dayOfWeek = date.toLocaleDateString(locale, { "weekday": "long" }).toUpperCase()
  const month = date.toLocaleDateString(locale, { "month": "long" }).toUpperCase()
  const dayOfMonth = date.getDate()
  const time = date.toLocaleTimeString(locale, { "hour": "numeric", "minute": "2-digit" })

  // Build the date container
  const dateDiv = document.createElement("div")
  const dayOfWeekHeader = document.createElement("h6")
  const monthHeader = document.createElement("h6")
  const dayOfMonthHeader = document.createElement("h1")
  dayOfWeekHeader.innerText = dayOfWeek
  monthHeader.innerText = month
  dayOfMonthHeader.innerText = dayOfMonth
  dateDiv.append(dayOfWeekHeader)
  dateDiv.append(monthHeader)
  dateDiv.append(dayOfMonthHeader)

  // Build the location container
  const locationDiv = document.createElement("div")
  const timeHeader = document.createElement("h6")
  const addressHeader = document.createElement("h6")
  timeHeader.innerText = time
  addressHeader.innerText = address
  locationDiv.append(timeHeader)
  locationDiv.append(addressHeader)

  // Build the title container
  const titleDiv = document.createElement("div")
  const titleAnchor = document.createElement("a")
  const titleHeader = document.createElement("h2")
  const gamesHeader = document.createElement("h6")
  titleAnchor.classList = "link-dark link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover"
  titleAnchor.href = url
  titleAnchor.target = "_blank"
  titleAnchor.innerText = title
  gamesHeader.innerText = games
  titleHeader.append(titleAnchor)
  titleDiv.append(titleHeader)
  titleDiv.append(gamesHeader)

  // Build the overarching container
  const containerDiv = document.createElement("div")
  containerDiv.append(dateDiv)
  containerDiv.append(locationDiv)
  containerDiv.append(titleDiv)
  return containerDiv
}

/**
 * Loads sheet data for upcoming events and appends it to the page.
 */
async function loadEventData() {
  // Fetch data from sheets
  const sheetId = "1AIMZepfkEIUmTYFgFY4t4wTQSXrP_YvETAB-WAwyCyM"
  const apiKey = "AIzaSyDJ-_OQLyugiuK-SOohB9MZ5zd4IoFJhrc"
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values:batchGet?key=${apiKey}&ranges=A:F`
  const json = await fetchJson(url)
  const rows = json.valueRanges[0].values.slice(1)

  // Append data to the page
  for (const row of rows) {
    console.log("ROW", row)
    const eventElement = buildEventElement(row)
    document.querySelector("div#event-container").append(eventElement)
  }
}

window.addEventListener("load", loadEventData)
