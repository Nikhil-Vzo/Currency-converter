
const BASE_URL = "https://api.frankfurter.app";


const dropdowns = document.querySelectorAll(".currency-selector select");
const fromCurrency = document.querySelector("select[name='from-currency']");
const toCurrency = document.querySelector("select[name='to-currency']");
const fromAmountInput = document.querySelector("#from-input");
const toAmountInput = document.querySelector("#to-input");
const submitButton = document.querySelector(".submit-btn");
const swapIcon = document.querySelector(".swap-icon");

async function populateDropdowns() {
    try {
        const response = await fetch(`${BASE_URL}/currencies`);
        if (!response.ok) {
            throw new Error("Failed to fetch currency list.");
        }
        const currencies = await response.json();

        for (let select of dropdowns) {
            for (let currencyCode in currencies) {
                let newOption = document.createElement("option");
                newOption.innerText = currencyCode;
                newOption.value = currencyCode;

            
                if (select.name === "from-currency" && currencyCode === "INR") {
                    newOption.selected = "selected";
                } else if (select.name === "to-currency" && currencyCode === "USD") {
                    newOption.selected = "selected";
                }
                select.append(newOption);
            }
            
            select.addEventListener("change", (event) => {
                updateFlag(event.target);
            });
        }
    } catch (error) {
        console.error("Error populating dropdowns:", error);
        alert("Could not load currency list. Please refresh the page.");
    }
}


const updateFlag = (element) => {
 
  const currencyCode = element.value;
  if (countryList[currencyCode]) {
      const countryCode = countryList[currencyCode];
      const newSrc = `https://flagsapi.com/${countryCode}/shiny/64.png`;
      const img = element.previousElementSibling;
      img.src = newSrc;
  }
};


const getExchangeRate = async () => {
    let amount = parseFloat(fromAmountInput.value);
    if (isNaN(amount) || amount < 1) {
        amount = 1;
        fromAmountInput.value = "1";
    }

    toAmountInput.placeholder = "Calculating...";
    const fromCurr = fromCurrency.value;
    const toCurr = toCurrency.value;

    if (fromCurr === toCurr) {
        toAmountInput.value = amount.toFixed(2);
        toAmountInput.placeholder = "Result";
        return;
    }
    
    const URL = `${BASE_URL}/latest?amount=${amount}&from=${fromCurr}&to=${toCurr}`;

    try {
        let response = await fetch(URL);
        if (!response.ok) {
            throw new Error(`Network response error: ${response.statusText}`);
        }
        let data = await response.json();
        let finalAmount = data.rates[toCurr];
        
        if (finalAmount === undefined) {
             throw new Error(`Rate for ${toCurr} not found.`);
        }
        
        toAmountInput.value = finalAmount.toFixed(2);
        toAmountInput.placeholder = "Result";

    } catch (error) {
        console.error("Fetch Error:", error);
        toAmountInput.value = "";
        toAmountInput.placeholder = "Error!";
    }
};

submitButton.addEventListener("click", (event) => {
    event.preventDefault();
    getExchangeRate();
});

swapIcon.addEventListener("click", () => {
    [fromCurrency.value, toCurrency.value] = [toCurrency.value, fromCurrency.value];
  
    fromCurrency.dispatchEvent(new Event('change'));
    toCurrency.dispatchEvent(new Event('change'));
    getExchangeRate();
});


async function initializeApp() {
    await populateDropdowns();
    updateFlag(fromCurrency); 
    updateFlag(toCurrency);
    getExchangeRate(); 
}


window.addEventListener("load", initializeApp);