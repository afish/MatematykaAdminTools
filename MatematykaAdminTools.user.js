// ==UserScript==
// @name         MatematykaAdminTools
// @namespace    https://matematyka.pl/
// @version      0.1
// @description  Provides some admin tools for Matematyka.pl missing after migration
// @author       Adam Furmanek
// @match        https://matematyka.pl/posting.php?mode=edit*
// @grant        none
// ==/UserScript==


(function() {
    'use strict';

  	var adminFunctions = {};

    (window || unsafeWindow).adminToolsFunction = adminFunctions;

    (function addModificationReasons(){
        adminFunctions.addModificationReason = function(reason){
            document.getElementById("edit_reason").value += reason;
        }

        var reasons = [
            { explanation: "Brak LaTeX-a, zapoznaj się z instrukcją https://matematyka.pl/viewtopic.php?t=28951 .", reason: "Brak LaTeX-a" },
            { explanation: "Niepoprawny kod LaTeX-a, zapoznaj sie z instrukcją https://matematyka.pl/viewtopic.php?t=28951 ", reason: "Kod LaTeX-a" },
            { explanation: "Obrazki zamiast zapisu w LaTeX-u.", reason: "Skany" },
            { explanation: "Nie dubluj tematów.", reason: "Duplikat" },
            { explanation: "Symbol mnożenia to \\cdot", reason: "Mnożenie" },
            { explanation: "Funkcje trygonometryczne zapisuj jako \\sin, \\cos itp.", reason: "Funkcje trygonometryczne" },
            { explanation: "Skaluj nawiasy przez \\left( i \\right)", reason: "Nawiasy" },
            { explanation: "Niedozwolone reklamy.", reason: "Reklama" }
        ];

        var reasonsElements = reasons.map(function(reason){
          	var link = document.createElement("a");
          	link.style = "padding-right: 10px";
          	link.onclick = adminFunctions.addModificationReason.bind(null, reason.explanation + " ");
          	link.innerText = reason.reason;
            return link;
        });
        var dl = document.createElement("dl");
        dl.innerHTML = "<dt><label for='edit_reason'>Szybki powód zmiany posta:</label></dt><dd id='quickReasons'></dd>";
        document.getElementById("edit_reason").closest("fieldset").appendChild(dl);
      	var dd = document.getElementById('quickReasons');
      	reasonsElements.map(function(element){
          dd.appendChild(element);
        });
    })();

    (function addButonToReplaceMultiplicationSign(){
        adminFunctions.replaceMultiplication = function(){
            var postBox = document.getElementById("message");
            var originalValue = postBox.value;
            var newValue = originalValue.replace(/[[]latex].*?[[]\/latex]/g, function(match, $1){
                return match.replace(/[*]/g, "\\cdot");
            });
            postBox.value = newValue;
        }

        var button = document.createElement("button");
        button.type = "button";
        button.className = "button button-secondary bbcode-latex";
        button.name = "replacemultiplication";
        button.value = "cdot";
        button.onclick = adminFunctions.replaceMultiplication;
        button.innerText = "cdot";
        document.getElementsByClassName("bbcode-latex")[0].closest("div").appendChild(button);
    })();
})();