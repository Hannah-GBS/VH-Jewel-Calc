const ATTRIBUTES = { "Choose attribute": "", "Picking": "#EAEAEA", "Axing": "#C4AC79", "Shovelling": "#E2E69F", "Hammering": "#25D4A5", "Reaping": "#3B8A40", "Wooden Affinity": "#B4590B", "Ornate Affinity": "#EC2525", "Gilded Affinity": "#CCA312", "Living Affinity": "#72FF41", "Coin Affinity": "#FFFF00", "Soulbound": "#9664FD", "Smelting": "#FF4500", "Pulverizing": "#73B373", "Mining Speed": "#48BAF8", "Copiously": "#F74780", "Vanilla Immortality": "#AF8DC3", "Durability": "#DFD0FE", "Item Quantity": "#E88A12", "Item Rarity": "#E5B819", "Trap Disarming": "#8143FF", "Reach": "#84D7FF", "Hammer Size": "#25D4A5" };
const PREFIXES = ["Picking", "Axing", "Shovelling", "Hammering", "Reaping", "Smelting", "Pulverizing", "Wooden Affinity", "Ornate Affinity", "Gilded Affinity", "Living Affinity", "Coin Affinity"];
const SUFFIXES = ["Mining Speed", "Durability", "Copiously", "Item Quantity", "Item Rarity", "Soulbound", "Trap Disarming", "Vanilla Immortality", "Reach", "Hammer Size"];
const MAX_SELECTORS = 4;
const TOOL_TYPES = ["Pickaxe", "Axe", "Cutter", "Shovel", "Mattock", "Excavator", "Paxel", "Hammer", "Claw Hammer", "Splitting Maul", "Cutting Hammer", "Mallet", "Brick Hammer", "Sledgehammer", "Shatterer", "Sickle", "Scythe", "Machete", "Billhook", "Pitchfork", "Field Shovel", "Cleaver", "Reaper"]

var jewelArray = localStorage.getItem("jewel_array") ? JSON.parse(localStorage.getItem('jewel_array')) : [];
var toolArray = localStorage.getItem("tool_array") ? JSON.parse(localStorage.getItem('tool_array')) : [];
var toolInEditor = false;

var jewelSelectorList = [];
var toolSelectorList = [];
var toolSelectorSprites = document.getElementsByClassName("toolSelectorSprite");

var currentTool = null;
var currentToolEdit;
var selectedJewels = []

addFormSelector(jewelSelectorList, document.getElementById("jewelFormDiv"), "jewel");
addFormSelector(toolSelectorList, document.getElementById("toolSetupForm2"), "tool");
document.getElementById("toolUUID").value = crypto.randomUUID();

updateSelectorListener(jewelSelectorList, "jewel");

function updateSelectorListener(selectorList, prefix) {
    var lastSelector = selectorList[selectorList.length - 1][0];

    selectorList.forEach((row) => {
        if (row[2] != null) {
            row[0].removeEventListener("change", row[2]);
            row[2] = null;
        }
    });

    var listener = addFormSelector.bind(null, selectorList, lastSelector.parentNode.parentNode, prefix)
    selectorList[selectorList.length - 1][2] = listener;
    lastSelector.addEventListener("change", listener);
};

function addFormSelector(selectorList, parentDiv, prefix) {
    if (selectorList.length == MAX_SELECTORS && prefix == "jewel") return;
    var customSelector = document.createElement("div");
    customSelector.setAttribute("class", "custom-select");
    customSelector.style.setProperty("width", "142px")
    var newSelector = document.createElement("select");
    var newValue = document.createElement("input");

    newSelector.name = prefix + "Selector" + (selectorList.length + 1).toString();
    newSelector.classList.add("selector");


    newValue.name = prefix + "SelectorValue" + (selectorList.length + 1).toString();
    newValue.classList.add("selectorValue");
    newValue.type = "number";
    newValue.style = "display: none;"

    Object.keys(ATTRIBUTES).forEach(key => {
        if (["Hammering", "Reaping"].includes(key)) return;

        var el = document.createElement("option");
        el.textContent = key;
        el.value = key;
        newSelector.appendChild(el);
    })

    var submitButton = document.getElementById(prefix + "SubmitButton");

    customSelector.appendChild(newSelector);
    parentDiv.insertBefore(customSelector, submitButton);
    parentDiv.insertBefore(newValue, submitButton);

    setupCustomSelector(customSelector);


    newSelector.addEventListener("change", formatFormSelectors.bind(null, selectorList, newSelector, prefix));
    selectorList.push([newSelector, newValue]);
    updateSelectorListener(selectorList, prefix);
}

function formatFormSelectors(selectorList, curSelector, prefix) {
    selectorList.forEach(row => {
        if (!row.includes(curSelector)) return;
        if (curSelector.value == "Choose attribute") {
            row.forEach(element => {
                if (element == null || typeof element == "function" || element == curSelector) {
                    return;
                } else {
                    element.remove();
                }
            })
            curSelector.parentNode.remove();

            selectorList.splice(selectorList.indexOf(row), 1);
            renameElements(selectorList, prefix);
            if (selectorList[selectorList.length - 1][0].value != "Choose attribute") addFormSelector(selectorList, selectorList[selectorList.length - 1][0].parentNode, prefix);
            return;
        }
        if (row.length == 4) row[3].remove();
        let smolStep = false;
        switch (curSelector.value) {
            case "Picking":
            case "Axing":
            case "Shovelling":
            case "Reaping":
            case "Wooden Affinity":
            case "Ornate Affinity":
            case "Gilded Affinity":
            case "Living Affinity":
            case "Coin Affinity":
            case "Soulbound":
            case "Smelting":
            case "Pulverizing":
                var placeholder = document.createElement("input")
                placeholder.name = row[1].name
                placeholder.type = "hidden";
                placeholder.value = true;
                var newBool = document.createElement("input");
                newBool.classList.add("selectorValue");
                newBool.type = "checkbox"
                newBool.disabled = true;
                newBool.checked = true;
                curSelector.parentNode.parentNode.replaceChild(newBool, row[1]);
                curSelector.parentNode.parentNode.insertBefore(placeholder, newBool);
                row[1] = placeholder;
                row[3] = newBool;
                break;
            case "Copiously":
            case "Item Quantity":
            case "Item Rarity":
                smolStep = true;
            case "Vanilla Immortality":
            case "Trap Disarming":
                var newPercentage = document.createElement("input");
                newPercentage.min = 0;
                newPercentage.step = smolStep ? 0.1 : 1;
                newPercentage.name = row[1].name;
                newPercentage.classList.add("selectorValue");
                newPercentage.type = "number";
                curSelector.parentNode.parentNode.replaceChild(newPercentage, row[1])
                row[1] = newPercentage;
                break;
            case "Durability":
            case "Hammer Size":
                var newInt = document.createElement("input");
                newInt.min = 0;
                newInt.step = 1;
                newInt.name = row[1].name;
                newInt.classList.add("selectorValue");
                newInt.type = "number";
                curSelector.parentNode.parentNode.replaceChild(newInt, row[1])
                row[1] = newInt;
                break;
            case "Reach":
                smolStep = true;
            case "Mining Speed":
                var newDecimal = document.createElement("input");
                newDecimal.step = smolStep ? 0.01 : 0.1;
                newDecimal.name = row[1].name;
                newDecimal.classList.add("selectorValue");
                newDecimal.type = "number";
                curSelector.parentNode.parentNode.replaceChild(newDecimal, row[1])
                row[1] = newDecimal;
                break;
            default:
                var newValue = document.createElement("input");
                newValue.name = row[1].name;
                newValue.classList.add("selectorValue");
                newValue.type = "number";
                newValue.style = "display:none;"
                curSelector.parentNode.parentNode.replaceChild(newValue, row[1])
                row[1] = newValue;
        }
    })
}


function renameElements(selectorList, prefix) {
    for (let i = 0; i < selectorList.length; i++) {
        selectorList[i][0].name = prefix + "Selector" + (i + 1).toString();

        selectorList[i][1].name = prefix + "SelectorValue" + (i + 1).toString();
    }
}

function getFormData(form, prefix) {
    var formData = Object.fromEntries(new FormData(form));
    var formattedData;

    if (prefix == "jewel") {
        formattedData = {
            uuid: crypto.randomUUID(),
            size: formData.size,
            selected: false,
            attributes: []
        };

        for (let i = 1; i <= MAX_SELECTORS; i++) {
            if ("jewelSelector" + i in formData && "jewelSelectorValue" + i in formData) {
                if (formData["jewelSelector" + i] == "Choose attribute") continue;
                let attributeObject = {
                    name: formData["jewelSelector" + i],
                    value: formData["jewelSelectorValue" + i]
                }
                formattedData.attributes.push(attributeObject)
            }
        }

    } else if (prefix == "tool") {
        formattedData = {
            uuid: formData.UUID,
            name: formData.toolName,
            materialTier: formData.toolTierSelector,
            toolType: formData.toolTypeSelector,
            capacity: formData.toolCapacity,
            attributes: [
                {
                    name: "Durability",
                    value: "4096"
                },
                {
                    name: "Mining Speed",
                    value: "9.0"
                },
                {
                    name: formData.implicitName,
                    value: "true"
                }
            ]
        };

        var numAttributes = Object.keys(formData).filter(key => key.includes("toolSelectorValue")).length;

        if (formData.hasOwnProperty("Hammer Size")) {
            formattedData.attributes.push({ name: "Hammer Size", value: "1" })
        }

        for (let i = 1; i < numAttributes; i++) {
            let newAttribute = {
                name: formData["toolSelector" + i],
                value: formData["toolSelectorValue" + i]
            }
            let newValue = true
            formattedData.attributes.forEach(attribute => {
                if (attribute.name == newAttribute.name) {
                    newValue = false;
                    if (attribute.value == "true") {
                        return;
                    } else {
                        attribute.value = (parseFloat(attribute.value) + parseFloat(newAttribute.value)).toString()
                    }
                }
            })

            if (newValue) formattedData.attributes.push(newAttribute);
        }


    }

    return formattedData;
}

function validateFormData(data, prefix) {
    if (prefix == "jewel") {
        if (!data.size) return "Jewel Size not set!";

        if (data.attributes.length == 0) return "No attributes added!";
        var error;
        var attributeList = []
        data.attributes.forEach(attribute => {
            attributeList.push(attribute.name);
            if (!attribute.value || attribute.value == "0") {
                error = attribute.name + " value not set!";
            }
        })

        if (error) return error;

        if ((new Set(attributeList)).size !== attributeList.length) return "Remove duplicate attributes!";

    } else if (prefix == "tool") {
        if (!data.name) return "Give your tool a name!";

        var error;
        var attributeList = []
        data.attributes.forEach(attribute => {
            attributeList.push(attribute.name);
            if (!attribute.value || attribute.value == "0") {
                error = attribute.name + " value not set!";
            }
        })
        if (attributeList.includes("Hammering") && attributeList.includes("Reaping")) return "Hammering and Reaping can not be on the same tool!";

        if (error) return error;
    }

    return
}

document.getElementById("jewelFormDiv").addEventListener("submit", function (e) {
    e.preventDefault();
    var formattedData = getFormData(e.target, "jewel");
    var validation = validateFormData(formattedData, "jewel");
    var errorDiv = document.getElementById("jewelFormError")
    if (validation) {
        errorDiv.textContent = validation;
        errorDiv.style.display = "block";
        return;
    } else {
        errorDiv.textContent = "";
        errorDiv.style.display = "none";
    }
    jewelArray.push(formattedData);
    localStorage.setItem("jewel_array", JSON.stringify(jewelArray));
    document.getElementById("jewelFormDiv").reset();
    jewelSelectorList.forEach(group => {
        group.forEach(element => {
            if (element == null || typeof element == "function" || element.classList.contains("selector")) {
                return;
            } else {
                element.remove();
            }
        })

        group.forEach(element => {
            if (element != null && element.parentNode != null) {
                element.parentNode.remove();
            }
        })
    });

    jewelSelectorList = [];
    addFormSelector(jewelSelectorList, document.getElementById("jewelFormDiv"), "jewel");
    addJewelPanel(formattedData);
});


document.getElementById("toolSetupForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var formattedData = getFormData(e.target, "tool");
    var validation = validateFormData(formattedData, "tool");
    var errorDiv = document.getElementById("toolFormError2");
    if (validation) {
        errorDiv.textContent = validation;
        errorDiv.style.display = "block";
        return;
    } else {
        errorDiv.textContent = "";
        errorDiv.style.display = "none";
    }
    var dupeTool = toolArray.find(object => object.uuid == formattedData.uuid);
    if (dupeTool) {
        toolArray[toolArray.indexOf(dupeTool)] = formattedData;
    } else {
        toolArray.push(formattedData);
    }
    localStorage.setItem("tool_array", JSON.stringify(toolArray));
    document.getElementById("toolSetupForm").reset();
    toolSelectorList.forEach(group => {
        group.forEach(element => {
            if (element == null || typeof element == "function") {
                return;
            } else {
                element.remove();
            }
        })
    })
    toolSelectorList = [];

    Object.values(toolSelectorSprites).forEach(element => element.classList.remove("toolSpriteSelected"))
    document.getElementById("toolTypeSelector").removeAttribute("value");

    document.getElementById("toolSetupForm2").style.setProperty("display", "none");
    document.getElementById("toolSetupForm1").style.removeProperty("display");
    document.getElementById("toolSetup").style.setProperty("--toolSpritesheet", "url(resources/tools/spritesheet-placeholder.png");
    e.target.getElementsByClassName("select-items")[0].firstChild.click();
    closeAllSelect();
    addFormSelector(toolSelectorList, document.getElementById("toolSetupForm2"), "tool");
    addToolPanel(formattedData);
})

function switchToolSprites() {
    var spritesheet;
    switch (this.value) {
        case "Chromatic Iron":
            spritesheet = "url(resources/tools/spritesheet-chromatic-iron.gif)";
            break;
        case "Chromatic Steel":
            spritesheet = "url(resources/tools/spritesheet-chromatic-steel.gif";
            break;
        case "Vaulterite":
            spritesheet = "url(resources/tools/spritesheet-vaulterite.png";
            break;
        case "Melded":
            spritesheet = "url(resources/tools/spritesheet-melded.gif";
            break;
        case "Black Chromatic Steel":
            spritesheet = "url(resources/tools/spritesheet-black-chromatic.gif";
            break;
        case "Echoing":
            spritesheet = "url(resources/tools/spritesheet-echoing.gif";
            break;
        case "Prismatic":
            spritesheet = "url(resources/tools/spritesheet-prismatic.gif";
            break;
        default:
            spritesheet = "url(resources/tools/spritesheet-placeholder.png";
    }

    document.getElementById("toolSetup").style.setProperty("--toolSpritesheet", spritesheet);

}

document.getElementById("toolTierSelector").addEventListener("change", switchToolSprites);

for (var i = 0; i < toolSelectorSprites.length; i++) {
    toolSelectorSprites.item(i).addEventListener("click", function (event) {
        if (event.button != 0) return;

        if (event.target.classList.contains("toolSpriteSelected")) {
            event.target.classList.remove("toolSpriteSelected");
            return;
        }

        var elements = document.getElementsByClassName("toolSpriteSelected");

        for (let j = 0; j < elements.length; j++) {
            elements[j].classList.remove("toolSpriteSelected");
        }

        event.target.classList.add("toolSpriteSelected");

        document.getElementById("toolTypeSelector").value = event.target.title;

    });
}

var customTierSelector = document.getElementById("customTierSelect");
setupCustomSelector(customTierSelector);
function setupCustomSelector(customSelector) {
    var selElement = customSelector.getElementsByTagName("select")[0];

    /* For each element, create a new DIV that will act as the selected item: */

    var selectedDiv = document.createElement("div");
    selectedDiv.setAttribute("class", "select-selected");
    selectedDiv.innerHTML = selElement.options[selElement.selectedIndex].innerHTML;
    customSelector.appendChild(selectedDiv);

    /* For each element, create a new DIV that will contain the option list: */
    var optionsDiv = document.createElement("div");
    optionsDiv.setAttribute("class", "select-items select-hide");
    for (let j = 0; j < selElement.length; j++) {
        /* For each option in the original select element,
        create a new DIV that will act as an option item: */
        var optionItem = document.createElement("div");
        if (j == 0) optionItem.setAttribute("class", "same-as-selected");
        optionItem.innerHTML = selElement.options[j].innerHTML;
        optionItem.addEventListener("click", function(e) {
            /* When an item is clicked, update the original select box,
            and the selected item: */
            var selElement = this.parentNode.parentNode.getElementsByTagName("select")[0];
            var selectedDiv = this.parentNode.previousSibling;
            if (selectedDiv.textContent == this.textContent) return;
            for (let i = 0; i < selElement.length; i++) {
                if (selElement[i].innerHTML == this.innerHTML) {
                    selElement.selectedIndex = i;
                    selElement.setAttribute("value", this.textContent);
                    selElement.dispatchEvent(new Event("change"));
                    selectedDiv.innerHTML = this.innerHTML;
                    
                    var prevSelected = this.parentNode.getElementsByClassName("same-as-selected");
                    for (let k = 0; k < prevSelected.length; k++) {
                        prevSelected[k].removeAttribute("class");
                    }
                    this.setAttribute("class", "same-as-selected");
                    console.log(this.getAttribute("class"));
                    console.log(this.textContent);
                    break;
                }
            }
            selectedDiv.click();
        });
        optionsDiv.appendChild(optionItem);
    }

    customSelector.appendChild(optionsDiv);
    selectedDiv.addEventListener("click", function(e) {
        /* When the select box is clicked, close any other select boxes,
        and open/close the current select box: */
        e.stopPropagation();
        closeAllSelect(this);
        this.nextSibling.classList.toggle("select-hide");
        this.classList.toggle("select-arrow-active");
    });
}

function closeAllSelect(element) {
    /* A function that will close all custom select boxes in the document,
    except the current select box: */
    var arrNo = [];
    var selectItems = document.getElementsByClassName("select-items");
    var selectedDivs = document.getElementsByClassName("select-selected");

    for (let i = 0; i < selectedDivs.length; i++) {
        if (element == selectedDivs[i]) {
            arrNo.push(i);
        } else {
            selectedDivs[i].classList.remove("select-arrow-active");
        }
    }
    
    for (let i = 0; i < selectItems.length; i++) {
        if (arrNo.indexOf(i)) {
            selectItems[i].classList.add("select-hide");
        }
    }
}


function addBaseToolStats() {
    var baseCapacity;
    var materialTier = document.getElementById("toolTierSelector").value;
    var toolType = document.getElementById("toolTypeSelector").value;
    var color;

    if (materialTier == "Select a tier" || !toolType) return;

    switch (materialTier) {
        case "Chromatic Iron":
            baseCapacity = 100;
            break;
        case "Chromatic Steel":
            baseCapacity = 150;
            break;
        case "Vaulterite":
            baseCapacity = 200;
            break;
        case "Melded":
            baseCapacity = 250;
            break;
        case "Black Chromatic Steel":
            baseCapacity = 300;
            break;
        case "Echoing":
            baseCapacity = 350;
            break;
        case "Prismatic":
            baseCapacity = 400;
            break;
    }

    document.getElementById("toolImpCapacity").value = baseCapacity;

    var toolTypeDisplay = document.getElementById("toolImpAttributeDisplay");
    var toolTypeInput = document.getElementById("toolImpAttribute");

    document.getElementById("toolImpHammerDisplay").style.setProperty("display", "none")
    document.getElementById("toolImpHammerValue").style.setProperty("display", "none");
    document.getElementById("toolImpHammerSize").removeAttribute("name");


    switch (toolType) {
        case "Pickaxe":
            toolTypeDisplay.textContent = "Picking";
            toolTypeInput.value = "Picking";
            color = ATTRIBUTES.Picking;
            break;
        case "Axe":
            toolTypeDisplay.textContent = "Axing";
            toolTypeInput.value = "Axing";
            color = ATTRIBUTES.Axing;
            break;
        case "Shovel":
            toolTypeDisplay.textContent = "Shovelling";
            toolTypeInput.value = "Shovelling";
            color = ATTRIBUTES.Shovelling;
            break;
        case "Hammer":
            toolTypeDisplay.textContent = "Hammering";
            toolTypeInput.value = "Hammering";
            document.getElementById("toolImpHammerDisplay").style.removeProperty("display")
            document.getElementById("toolImpHammerValue").style.removeProperty("display");
            document.getElementById("toolImpHammerSize").name = "Hammer Size";
            color = ATTRIBUTES.Hammering;
            break;
        case "Sickle":
            toolTypeDisplay.textContent = "Reaping";
            toolTypeInput.value = "Reaping";
            color = ATTRIBUTES.Reaping;
            break;
    }

    toolTypeDisplay.style.setProperty("color", color);


}

document.getElementById("toolNextButton").addEventListener("click", function (event) {
    if (event.button != 0) return;

    var errorDiv = document.getElementById("toolFormError1")

    if (document.getElementById("toolTierSelector").value == "Select a tier" || !document.getElementById("toolTypeSelector").value) {
        errorDiv.textContent = "Select a Material Tier AND base Tool Type";
        errorDiv.style.display = "block";
        return;
    } else {
        errorDiv.textContent = "";
        errorDiv.style.display = "none";
    }
    addBaseToolStats();
    document.getElementById("toolSetupForm1").style.setProperty("display", "none");
    document.getElementById("toolSetupForm2").style.removeProperty("display");
});

document.getElementById("toolBackButton").addEventListener("click", function (event) {
    if (event.button != 0) return;

    document.getElementById("toolSetupForm2").style.setProperty("display", "none");
    document.getElementById("toolSetupForm1").style.removeProperty("display");
})

document.getElementById("toolsHeader").addEventListener("click", function (event) {
    if (event.button != 0) return;

    var arrow = document.getElementById("toolArrow")
    arrow.classList.toggle("fi-bs-angle-down");
    arrow.classList.toggle("fi-bs-angle-right");

    var jewelListDiv = document.getElementById("toolList");
    jewelListDiv.style.setProperty("display", jewelListDiv.style.getPropertyValue("display") == "flex" ? "none" : "flex");
})

function getToolType(toolData) {
    var toolInt = 0;

    toolData.attributes.forEach(attribute => {
        switch (attribute.name) {
            case "Picking":
                toolInt += 1;
                break;
            case "Axing":
                toolInt += 2;
                break;
            case "Shovelling":
                toolInt += 4;
                break;
            case "Hammering":
                toolInt += 8;
                break;
            case "Reaping":
                toolInt += 16;
                break;
        }
    })
    var toolType = TOOL_TYPES[toolInt - 1];

    return toolType;
}

function getToolSpritesheet(toolData) {
    var spritesheet;
    switch (toolData.materialTier) {
        case "Chromatic Iron":
            spritesheet = "url(resources/tools/spritesheet-chromatic-iron.gif)";
            break;
        case "Chromatic Steel":
            spritesheet = "url(resources/tools/spritesheet-chromatic-steel.gif";
            break;
        case "Vaulterite":
            spritesheet = "url(resources/tools/spritesheet-vaulterite.png";
            break;
        case "Melded":
            spritesheet = "url(resources/tools/spritesheet-melded.gif";
            break;
        case "Black Chromatic Steel":
            spritesheet = "url(resources/tools/spritesheet-black-chromatic.gif";
            break;
        case "Echoing":
            spritesheet = "url(resources/tools/spritesheet-echoing.gif";
            break;
        case "Prismatic":
            spritesheet = "url(resources/tools/spritesheet-prismatic.gif";
            break;
        default:
            spritesheet = "url(resources/tools/spritesheet-placeholder.png";
    }
    return spritesheet;
}

function addToolPanel(toolData) {
    var root = document.getElementById("toolList");

    var toolType = getToolType(toolData);

    var spritesheet = getToolSpritesheet(toolData);

    var panelDiv = document.createElement("div");
    panelDiv.classList.add("toolDisplay");
    panelDiv.id = "toolDisplay-" + toolData.uuid;
    panelDiv.setAttribute("data-tool_data", JSON.stringify(toolData));

    panelDiv.style.setProperty("--toolSpritesheet", spritesheet);
    panelDiv.addEventListener("click", function (event) {
        if (event.button != 0) return;

        if (toolInEditor) return;

        loadToolEditor(toolData);
        panelDiv.classList.add("toolDisplay-selected");
    })

    var topBar = document.createElement("div");
    topBar.style = "display:grid; height:80px; grid-template-columns: 70px 70px 70px;";

    var nameLabel = document.createElement("p");
    nameLabel.textContent = toolData.name;
    nameLabel.classList.add("toolNameLabel");
    topBar.appendChild(nameLabel);

    var capacityLabel = document.createElement("p");
    capacityLabel.textContent = toolData.capacity;
    capacityLabel.classList.add("sizeLabel");
    topBar.appendChild(capacityLabel);

    var imageDiv = document.createElement("div");
    imageDiv.classList.add("toolSprite", "toolImage", camelCase(toolType + " Sprite"));
    imageDiv.id = "toolImage-" + toolData.uuid;
    topBar.appendChild(imageDiv);

    var deleteLabel = document.createElement("i");
    deleteLabel.classList.add("fi", "fi-rs-trash", "deleteLabel");
    topBar.appendChild(deleteLabel);

    deleteLabel.addEventListener("click", function (event) {
        event.stopPropagation();
        if (event.button != 0) return;

        if (toolInEditor && currentTool.uuid == toolData.uuid) {
            alert("This tool is currently in the Tool Editor and can not be deleted!")
            return;
        }

        if (!window.confirm("Are you sure you want to delete " + toolData.name + "?")) return;
        // TO DO - Confirmation?
        panelDiv.remove();
        toolArray.splice(toolArray.indexOf(toolData), 1);
        localStorage.setItem("tool_array", JSON.stringify(toolArray));

    })

    panelDiv.appendChild(topBar);

    var prefixDiv = document.createElement("div");
    var suffixDiv = document.createElement("div");
    prefixDiv.style = "display:grid";
    suffixDiv.style = "display:grid; margin-bottom: 5px";

    toolData.attributes.forEach(attribute => {
        var attributeName = document.createElement("p");
        attributeName.textContent = attribute.name;
        attributeName.classList.add("attributeName");
        attributeName.style = `color: ${ATTRIBUTES[attribute.name]}`;

        var attributeValue = document.createElement("p");
        attributeValue.classList.add("attributeValue");
        if (attribute.value != "true") {
            attributeValue.textContent = attribute.value;
            if ((["Copiously", "Vanilla Immortality", "Item Quanttity", "Item Rarity", "Trap Disarming"]).includes(attribute.name)) attributeValue.textContent += "%";
            attributeValue.style = `color: ${ATTRIBUTES[attribute.name]}`;
        }

        if (PREFIXES.includes(attribute.name)) {
            prefixDiv.appendChild(attributeName);
            prefixDiv.appendChild(attributeValue);
        } else {
            suffixDiv.appendChild(attributeName);
            suffixDiv.appendChild(attributeValue);
        }
    })

    panelDiv.appendChild(prefixDiv);
    panelDiv.appendChild(suffixDiv);

    root.appendChild(panelDiv);

    return panelDiv;
}

document.getElementById("jewelsHeader").addEventListener("click", function (event) {
    if (event.button != 0) return;

    var arrow = document.getElementById("jewelArrow")
    arrow.classList.toggle("fi-bs-angle-down");
    arrow.classList.toggle("fi-bs-angle-right");

    var jewelListDiv = document.getElementById("jewelList");
    jewelListDiv.style.setProperty("display", jewelListDiv.style.getPropertyValue("display") == "flex" ? "none" : "flex");
})

function addJewelPanel(jewelData) {
    var root = document.getElementById("jewelList");

    var panelDiv = document.createElement("div");
    panelDiv.classList.add("jewelDisplay");
    panelDiv.id = "jewelDisplay-" + jewelData.uuid;
    panelDiv.setAttribute("data-jewel_data", JSON.stringify(jewelData));

    panelDiv.addEventListener("click", function (event) {
        if (event.button != 0) return;
        if (!toolInEditor) {
            alert("Set up a new tool or pick one from your Tool Library before adding jewels!");
            return;
        }

        if (parseInt(currentToolEdit.capacity) < parseInt(jewelData.size)) {
            return;
        }

        if (jewelData.selected) {
            jewelData.selected = false;
            panelDiv.classList.remove("jewelDisplay-selected");
        } else {
            jewelData.selected = true;
            panelDiv.classList.add("jewelDisplay-selected");
        }
        refreshSelectedJewels();
    });

    var topBar = document.createElement("div");
    topBar.style = "display:grid; height:64px; grid-template-columns: 70px 70px 70px;";

    var sizeLabel = document.createElement("p");
    sizeLabel.textContent = jewelData.size;
    sizeLabel.classList.add("sizeLabel");
    topBar.appendChild(sizeLabel);

    var imageDiv = document.createElement("div");
    imageDiv.classList.add("jewelImage");
    // imageDiv.id = "jewelImage-" + jewelData.uuid;
    topBar.appendChild(imageDiv);

    var gemTintDiv = document.createElement("div");
    gemTintDiv.classList.add("gemTint");
    // gemTintDiv.id = "gemTint-" + jewelData.uuid;
    imageDiv.appendChild(gemTintDiv);

    var frame = document.createElement("img");
    frame.classList.add("frame");
    frame.src = "resources/frame.png";
    imageDiv.appendChild(frame);

    var names = jewelData.attributes.map(attribute => attribute.name);
    var colors = Object.entries(ATTRIBUTES)
        .filter((attribute) => names.includes(attribute[0]))
        .map(attribute => attribute[1]);

    switch (colors.length) {
        case 1:
            gemTintDiv.style = `background-color: ${colors[0]}`
            break;
        case 2:
            gemTintDiv.style = `animation: two-color-change 5s infinite; --color1: ${colors[0]}; --color2: ${colors[1]}`
            break;
        case 3:
            gemTintDiv.style = `animation: three-color-change 10s infinite; --color1: ${colors[0]}; --color2: ${colors[1]}; --color3: ${colors[2]}`
        case 4:
            gemTintDiv.style = `animation: four-color-change 15s infinite; --color1: ${colors[0]}; --color2: ${colors[1]}; --color3: ${colors[2]}; --color4:${colors[3]}`
    }

    var deleteLabel = document.createElement("i");
    deleteLabel.classList.add("fi", "fi-rs-trash", "deleteLabel");
    // deleteLabel.id = "deleteLabel-" + jewelData.uuid;
    topBar.appendChild(deleteLabel);

    deleteLabel.addEventListener("click", function (event) {
        event.stopPropagation();
        if (event.button != 0) return;

        panelDiv.remove();
        jewelArray.splice(jewelArray.indexOf(jewelData), 1);
        localStorage.setItem("jewel_array", JSON.stringify(jewelArray));
        refreshSelectedJewels();
    })

    panelDiv.appendChild(topBar);

    var prefixDiv = document.createElement("div");
    var suffixDiv = document.createElement("div");
    prefixDiv.style = "display:grid";
    suffixDiv.style = "display:grid";


    jewelData.attributes.forEach(attribute => {
        var attributeName = document.createElement("p");
        attributeName.textContent = attribute.name;
        attributeName.classList.add("attributeName");
        attributeName.style = `color: ${ATTRIBUTES[attribute.name]}`;

        var attributeValue = document.createElement("p");
        attributeValue.classList.add("attributeValue");
        if (attribute.value != "true") {
            attributeValue.textContent = attribute.value;
            if ((["Copiously", "Vanilla Immortality", "Item Quanttity", "Item Rarity", "Trap Disarming"]).includes(attribute.name)) attributeValue.textContent += "%";
            attributeValue.style = `color: ${ATTRIBUTES[attribute.name]}`;
        }

        if (PREFIXES.includes(attribute.name)) {
            prefixDiv.appendChild(attributeName);
            prefixDiv.appendChild(attributeValue)
        } else {
            suffixDiv.appendChild(attributeName);
            suffixDiv.appendChild(attributeValue);
        }
    });

    panelDiv.appendChild(prefixDiv);
    panelDiv.appendChild(suffixDiv);

    root.appendChild(panelDiv);
}

function camelCase(str) {
    // converting all characters to lowercase
    var ans = str.toLowerCase();

    // Returning string to camelcase
    return ans.split(" ").reduce((s, c) => s
        + (c.charAt(0).toUpperCase() + c.slice(1)));

}

function refreshSelectedJewels() {
    selectedJewels = jewelArray.filter(jewel => jewel.selected);
    currentToolEdit = JSON.parse(JSON.stringify(currentTool));

    // add jewels to currentToolEdit
    selectedJewels.forEach(jewel => {
        currentToolEdit.capacity -= jewel.size;
        jewel.attributes.forEach(attribute => {
            let attributeMatch = currentToolEdit.attributes.find(element => element.name == attribute.name);

            if (attributeMatch) {
                if (attribute.value == "true") return;
                attributeMatch.value = (parseFloat(attributeMatch.value) + parseFloat(attribute.value)).toString();
            } else {
                currentToolEdit.attributes.push(attribute);
            }

        })
    })

    var toolName = document.getElementById("toolEditorName");
    var toolImage = document.getElementById("toolEditorImage");
    toolImage.className = "toolSprite";
    var capacity = document.getElementById("toolEditorCapacity");
    var prefixDiv = document.getElementById("toolEditorPrefixes");
    var suffixDiv = document.getElementById("toolEditorSuffixes");
    var prefixes = prefixDiv.children;
    var suffixes = suffixDiv.children;

    Object.values(prefixes).forEach(prefix => prefix.remove())
    Object.values(suffixes).forEach(suffix => suffix.remove())

    if (currentToolEdit) {
        toolName.textContent = currentToolEdit.name;
        capacity.textContent = currentToolEdit.capacity;
        let toolType = getToolType(currentToolEdit);
        toolImage.classList.add(camelCase(toolType + " Sprite"))
        currentToolEdit.attributes.forEach(attribute => {
            var attributeName = document.createElement("p");
            attributeName.textContent = attribute.name;
            attributeName.classList.add("attributeName");
            attributeName.style = `color: ${ATTRIBUTES[attribute.name]}`;

            var attributeValue = document.createElement("p");
            attributeValue.classList.add("attributeValue");
            if (attribute.value != "true") {
                attributeValue.textContent = attribute.value;
                if ((["Copiously", "Vanilla Immortality", "Item Quanttity", "Item Rarity", "Trap Disarming"]).includes(attribute.name)) attributeValue.textContent += "%";
                attributeValue.style = `color: ${ATTRIBUTES[attribute.name]}`;
            }

            if (PREFIXES.includes(attribute.name)) {
                prefixDiv.appendChild(attributeName);
                prefixDiv.appendChild(attributeValue)
            } else {
                suffixDiv.appendChild(attributeName);
                suffixDiv.appendChild(attributeValue);
            }
        })

    } else {
        toolName.textContent = "";
        toolImage.style.removeProperty("--toolSpritesheet");
        capacity.textContent = "";
    }
}

function loadToolEditor(toolData) {
    currentTool = toolData;
    currentToolEdit = JSON.parse(JSON.stringify(currentTool));

    toolInEditor = true;

    var prefixDiv = document.getElementById("toolEditorPrefixes");
    var suffixDiv = document.getElementById("toolEditorSuffixes");
    var toolNameDiv = document.getElementById("toolEditorName");
    var toolImageDiv = document.getElementById("toolEditorImage");
    var toolCapacityDiv = document.getElementById("toolEditorCapacity");

    toolData.attributes.forEach(attribute => {
        var attributeName = document.createElement("p");
        attributeName.textContent = attribute.name;
        attributeName.classList.add("attributeName");
        attributeName.style = `color: ${ATTRIBUTES[attribute.name]}`;

        var attributeValue = document.createElement("p");
        attributeValue.classList.add("attributeValue");
        if (attribute.value != "true") {
            attributeValue.textContent = attribute.value;
            if ((["Copiously", "Vanilla Immortality", "Item Quanttity", "Item Rarity", "Trap Disarming"]).includes(attribute.name)) attributeValue.textContent += "%";
            attributeValue.style = `color: ${ATTRIBUTES[attribute.name]}`;
        }

        if (PREFIXES.includes(attribute.name)) {
            prefixDiv.appendChild(attributeName);
            prefixDiv.appendChild(attributeValue);
        } else {
            suffixDiv.appendChild(attributeName);
            suffixDiv.appendChild(attributeValue);
        }
    });

    var toolType = getToolType(toolData);

    toolNameDiv.textContent = toolData.name;
    toolCapacityDiv.textContent = toolData.capacity;
    toolImageDiv.classList.add(camelCase(toolType + " Sprite"));

    var spritesheet = getToolSpritesheet(toolData);
    toolImageDiv.style.setProperty("--toolSpritesheet", spritesheet);

}

function deselectAllJewels() {
    selectedJewels = [];
    currentToolEdit = JSON.parse(JSON.stringify(currentTool));

    jewelDivs = document.getElementsByClassName("jewelDisplay-selected");
    jewelArray.filter(jewel => jewel.selected).forEach(jewel => jewel.selected = false);
    Object.values(jewelDivs).forEach(jewel => jewel.classList.remove("jewelDisplay-selected"));

    refreshSelectedJewels();
}

function deselectTool() {

    currentTool = null;
    currentToolEdit = null;
    toolInEditor = false;

    Object.values(document.getElementsByClassName("toolDisplay-selected")).forEach(element => element.classList.remove("toolDisplay-selected"));
    deselectAllJewels();
}

function saveEditedTool() {
    if (JSON.stringify(currentTool) == JSON.stringify(currentToolEdit)) return;

    // delete selected jewels from jewelArray + divs
    selectedJewels.forEach(jewel => {
        jewelDiv = document.getElementById("jewelDisplay-" + jewel.uuid);
        jewelDiv.remove();
        jewelArray.splice(jewelArray.indexOf(jewel), 1);
    });

    // delete old tool instance from toolArray + div
    toolArray.splice(toolArray.indexOf(currentTool), 1)
    oldToolDiv = document.getElementById("toolDisplay-" + currentTool.uuid);
    oldToolDiv.remove();

    // add edited tool to toolArray + div
    toolArray.push(currentToolEdit);
    newToolDiv = addToolPanel(currentToolEdit);
    newToolDiv.classList.add("toolDisplay-selected");

    // currentTool = editedTool
    currentTool = currentToolEdit;

    // redraw editor
    refreshSelectedJewels();

    localStorage.setItem("tool_array", JSON.stringify(toolArray));
    localStorage.setItem("jewel_array", JSON.stringify(jewelArray));

}

document.getElementById("toolResetJewels").addEventListener("click", function (event) {
    if (event.button != 0) return;

    deselectAllJewels();
})

document.getElementById("toolResetTool").addEventListener("click", function (event) {
    if (event.button != 0) return;

    deselectTool();
})

document.getElementById("saveEditedTool").addEventListener("click", function (event) {
    if (event.button != 0) return;

    saveEditedTool();
})

// Load elements from localStorage
toolArray.forEach(tool => addToolPanel(tool));
jewelArray.forEach(jewel => addJewelPanel(jewel));