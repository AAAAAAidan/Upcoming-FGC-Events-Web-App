// TODO
// 1. Add background theme selection
// 2. Add event edit and removal options (maybe)
// 3. Improve mobile view

// Set to true when testing
const isDevelopmentModeEnabled = false

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
 * Get a search parameter value from the current URL, defaulting to a given
 * value if the search parameter doesn't have a value.
 * @param {String} parameterName - The search parameter name.
 * @param {Object} [defaultValue] - An optional default value.
 * @returns {Object} Returns the value parameter value or the default value.
 */
function getSearchParameter(parameterName, defaultValue) {
  const url = new URL(window.location.href)
  const parameterValue = url.searchParams.get(parameterName)
  return parameterValue || defaultValue
}

/**
 * Download the page content as a JPG file.
 */
async function downloadJpg() {
  const result = await snapdom(document.querySelector("main"), { "scale": 2 })
  await result.download({ "format": "jpg", "filename": "upcoming-fgc-events" })
}

/**
 * Copy the current URL to the user's clipboard.
 */
function copyLink() {
  navigator.clipboard.writeText(window.location.href)
  const linkToast = document.querySelector("div#link-toast")
  bootstrap.Toast.getOrCreateInstance(linkToast, { "delay": 2000 }).show()
}

/**
 * Apply the current event filters, hiding and showing applicable events.
 */
function applyFilters() {
  const countriesString = document.querySelector("input#countries-input").value
  const statesString = document.querySelector("input#states-input").value
  const gamesString = document.querySelector("input#games-input").value
  // Return a comma separated string as a array of lowercase trimmed strings
  const commaSeparatedStringToArray = (commaSeparatedString) => commaSeparatedString.split(",").map(string => string.trim().toLowerCase())
  const countries = commaSeparatedStringToArray(countriesString)
  const states = commaSeparatedStringToArray(statesString)
  const games = commaSeparatedStringToArray(gamesString)
  const eventDivs = document.querySelectorAll("div.event")

  for (const eventDiv of eventDivs) {
    // Check for values containing the entered string rather than an exact match
    const eventIsInOneOfTheSelectedCountries = countriesString === "" || countries.some(country => eventDiv.country.includes(country))
    const eventIsInOneOfTheSelectedStates = statesString === "" || states.some(state => eventDiv.state.includes(state))
    const eventIncludesOneOfTheSelectedGames = gamesString === "" || games.some(inputGame => eventDiv.games.some(eventGame => eventGame.includes(inputGame)))

    // If all of the filters were either unapplied or match the event, show it
    if (eventIsInOneOfTheSelectedCountries && eventIsInOneOfTheSelectedStates && eventIncludesOneOfTheSelectedGames) {
      eventDiv.style.display = "inline"
    } else {
      eventDiv.style.display = "none"
    }
  }

  // Update the search parameters in the URL to match the filters
  const url = new URL(window.location.href)
  url.searchParams.set("countries", countries)
  url.searchParams.set("states", states)
  url.searchParams.set("games", games)
  // Delete any empty search parameters
  url.searchParams.delete("countries", "")
  url.searchParams.delete("states", "")
  url.searchParams.delete("games", "")
  window.history.replaceState({}, document.title, url)
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
  const country = data[3]
  const state = data[4]
  const address = data[5].toUpperCase()
  const gamesString = data[6].toUpperCase()
  requireValue(dateString, "Date (data index 0) cannot be null or undefined")
  requireValue(url, "URL (data index 2) cannot be null or undefined")
  requireValue(address, "Address (data index 3) cannot be null or undefined")
  requireValue(gamesString, "Games (data index 4) cannot be null or undefined")
  requireValue(address, "Address (data index 3) cannot be null or undefined")

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
  dayOfMonthDiv.classList = "col-auto"

  // Build the month container
  const monthDiv = document.createElement("div")
  const dayOfWeekHeader = document.createElement("h6")
  const monthHeader = document.createElement("h6")
  dayOfWeekHeader.innerText = dayOfWeek
  monthHeader.innerText = month
  monthDiv.append(dayOfWeekHeader)
  monthDiv.append(monthHeader)
  monthDiv.classList = "col-auto"

  // Build the location container
  const locationDiv = document.createElement("div")
  const timeHeader = document.createElement("h6")
  const addressHeader = document.createElement("h6")
  timeHeader.innerText = time
  addressHeader.innerText = address
  locationDiv.append(timeHeader)
  locationDiv.append(addressHeader)
  locationDiv.classList = "col-auto text-body-secondary"

  // Build the title container
  const titleDiv = document.createElement("div")
  const titleAnchor = document.createElement("a")
  const titleHeader = document.createElement("h3")
  const gamesHeader = document.createElement("h6")
  titleAnchor.classList = "link-light link-offset-2 link-underline-opacity-0 link-underline-opacity-100-hover"
  titleAnchor.href = url
  titleAnchor.target = "_blank"
  titleAnchor.innerText = title
  gamesHeader.innerText = gamesString
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
  eventDiv.classList = "event col-md-6 mb-4"
  eventDiv.country = country.toLowerCase()
  eventDiv.state = state.toLowerCase()
  eventDiv.games = gamesString.toLowerCase().split(" / ")
  return eventDiv
}

/**
 * Load sheet data for upcoming events and append it to the page.
 */
async function loadEventData() {
  // Fetch data from sheets
  const sheetId = isDevelopmentModeEnabled ? "1MZfWoS2bUUpnvHfZDCPUc0DnscJSIac7BVQNvSBIEMg" : "1AIMZepfkEIUmTYFgFY4t4wTQSXrP_YvETAB-WAwyCyM"
  const apiKey = "AIzaSyDJ-_OQLyugiuK-SOohB9MZ5zd4IoFJhrc"
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values:batchGet?key=${apiKey}&ranges=A:G`
  const json = await fetchJson(url)
  const rows = json.valueRanges[0].values.slice(1)

  // Append each row's data to the page
  for (const row of rows) {
    console.log("ROW", row)
    const eventElement = buildEventElement(row)

    // If an event element was created, append it to the page content
    if (eventElement) {
      document.querySelector("div#event-container").append(eventElement)
    }
  }

  // Add event listeners
  document.querySelector("button#save-button").addEventListener("click", downloadJpg)
  document.querySelector("button#share-button").addEventListener("click", copyLink)
  document.querySelectorAll("input#countries-input, input#states-input, input#games-input").forEach(input => input.addEventListener("keyup", applyFilters))
  // Update the filters to match the URL search parameters
  document.querySelector("input#countries-input").value = getSearchParameter("countries", "")
  document.querySelector("input#states-input").value = getSearchParameter("states", "")
  document.querySelector("input#games-input").value = getSearchParameter("games", "")
  applyFilters()
}

window.addEventListener("load", loadEventData)
