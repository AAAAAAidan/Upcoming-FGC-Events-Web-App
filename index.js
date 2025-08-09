// TODO
// 1. Add download button
// 2. Add game and state filters
// 3. Add background theme selection
// 4. Add event edit and removal options

/**
 * Require a given value to be defined and not set to falue or an empty string.
 * @param {Object} value - The value to be required.
 * @param {String} errorMessage - The message to throw if the condition fails.
 */
function requireValue(value, errorMessage) {
  if (!value) {
    throw new Error(errorMessage)
  }
}

/**
 * Fetch a JSON object from a URL GET response.
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
 * Get a query parameter value from the current URL, defaulting to a given value
 * if the query parameter doesn't have a value.
 * @param {String} parameterName - The query parameter name.
 * @param {Object} [defaultValue] - An optional default value.
 * @returns {Object} Returns the query parameter value or the default value.
 */
function getQueryParameter(parameterName, defaultValue) {
  const url = new URL(window.location.href)
  const parameterValue = url.searchParams.get(parameterName)
  return parameterValue || defaultValue
}

/**
 * Create a div element containing event data.
 * @param {Array[String]} data - Values: [date, title, URL, address, games].
 * @returns {Element} Returns a div element.
 */
function buildEventElement(data) {
  // Set up event data values
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
  const selectedGames = getQueryParameter("games", "").toUpperCase().split(",")
  const doesEventHaveAnySelectedGames = selectedGames.some(selectedGame => games.includes(selectedGame))

  // If this event doesn't include a bracket for any selected games, skip it
  if (selectedGames.length > 0 && doesEventHaveAnySelectedGames === false) {
    return null
  }

  // Set up time related values
  const locale = navigator.languages ? navigator.languages[0] : navigator.language
  const date = new Date(dateString)
  const dayOfWeek = date.toLocaleDateString(locale, { "weekday": "long" }).toUpperCase()
  const month = date.toLocaleDateString(locale, { "month": "long" }).toUpperCase()
  const dayOfMonth = date.getDate() < 10 ? "0" + date.getDate() : date.getDate()
  const time = date.toLocaleTimeString(locale, { "hour": "numeric", "minute": "2-digit" })

  // Build the day of month container
  const dayOfMonthDiv = document.createElement("div")
  const dayOfMonthHeader = document.createElement("h1")
  dayOfMonthHeader.innerText = dayOfMonth
  dayOfMonthDiv.append(dayOfMonthHeader)
  dayOfMonthDiv.classList = "col w-auto"

  // Build the month container
  const monthDiv = document.createElement("div")
  const dayOfWeekHeader = document.createElement("h6")
  const monthHeader = document.createElement("h6")
  dayOfWeekHeader.innerText = dayOfWeek
  monthHeader.innerText = month
  monthDiv.append(dayOfWeekHeader)
  monthDiv.append(monthHeader)
  monthDiv.classList = "col w-auto"

  // Build the location container
  const locationDiv = document.createElement("div")
  const timeHeader = document.createElement("h6")
  const addressHeader = document.createElement("h6")
  timeHeader.innerText = time
  addressHeader.innerText = address
  locationDiv.append(timeHeader)
  locationDiv.append(addressHeader)
  locationDiv.classList = "col w-auto text-body-secondary"

  // Build the title container
  const titleDiv = document.createElement("div")
  const titleAnchor = document.createElement("a")
  const titleHeader = document.createElement("h3")
  const gamesHeader = document.createElement("h6")
  titleAnchor.classList = "link-light link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover"
  titleAnchor.href = url
  titleAnchor.target = "_blank"
  titleAnchor.innerText = title
  gamesHeader.innerText = games
  gamesHeader.classList = "text-body-secondary"
  titleHeader.append(titleAnchor)
  titleDiv.append(titleHeader)
  titleDiv.append(gamesHeader)

  // Build the overarching containers
  const dateAndLocationDiv = document.createElement("div")
  dateAndLocationDiv.append(dayOfMonthDiv)
  dateAndLocationDiv.append(monthDiv)
  dateAndLocationDiv.append(locationDiv)
  dateAndLocationDiv.classList = "row row-cols-3"
  const borderedDiv = document.createElement("div")
  borderedDiv.append(dateAndLocationDiv)
  borderedDiv.append(titleDiv)
  borderedDiv.classList = "p-2 border rounded bg-body-secondary"
  const eventDiv = document.createElement("div")
  eventDiv.append(borderedDiv)
  eventDiv.classList = "col-md-6 mb-4"
  return eventDiv
}

/**
 * Load sheet data for upcoming events and append it to the page.
 */
async function loadEventData() {
  // Fetch data from sheets
  const sheetId = "1AIMZepfkEIUmTYFgFY4t4wTQSXrP_YvETAB-WAwyCyM"
  const apiKey = "AIzaSyDJ-_OQLyugiuK-SOohB9MZ5zd4IoFJhrc"
  const selectedStates = getQueryParameter("states","AZ").split(",")
  let rows = []

  // Add data for each of the selected states
  for (const state of selectedStates) {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values:batchGet?key=${apiKey}&ranges=${state}!A:F`
    const json = await fetchJson(url)

    // If data was returned, add it to the results
    if (json.valueRanges) {
      rows.push(...json.valueRanges[0].values.slice(1))
    }
  }

  // Append data to the page
  for (const row of rows) {
    console.log("ROW", row)
    const eventElement = buildEventElement(row)

    // If an event element was created, append it to the page content
    if (eventElement) {
      document.querySelector("div#event-container").append(eventElement)
    }
  }
}

window.addEventListener("load", loadEventData)
