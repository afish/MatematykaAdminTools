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

    var addButton = function(name, action){
        var button = document.createElement("button");
        button.type = "button";
        button.className = "button button-secondary bbcode-latex";
        button.name = name;
        button.value = name;
        button.onclick = action;
        button.innerText = name;
        document.getElementsByClassName("bbcode-latex")[0].closest("div").appendChild(button);
    };

    var getPostBox = function(){
        return document.getElementById("message");
    };

    var replacePostContent = function(replacer){
        var postBox = getPostBox();
        var originalValue = postBox.value;
        var newValue = replacer(originalValue);
        postBox.value = newValue;
    };

    var replaceInLatexTags = function(replacer){
        replacePostContent(function(postBody){
            return postBody.replace(/[[]latex].*?[[]\/latex]/g, replacer);
        });
    };

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
        addButton("cdot", function(){
            replaceInLatexTags(function(match, $1){
                return match.replace(/[*]/g, " \\cdot ");
            });
        });
    })();

    (function addButonToReplaceTypicalFunctions(){
        var replaceFunctionWithNonLettersNonSlashAround = function(content, functionName, replacement){
            var nonLetter = "([^a-zA-Z\\\\])";
            return content.replace(new RegExp(nonLetter + functionName + nonLetter, 'g'), function(match, p1, p2){
                return p1 + replacement + p2;
            });
        }

        var replacements = [
            {old: "sin", new: "\\sin"},
            {old: "cos", new: "\\cos"},
            {old: "log", new: "\\log"}
        ];
        addButton("sin", function(){
            replaceInLatexTags(function(match, $1){
                var original = match;
                replacements.map(function(replacement){
                    original = replaceFunctionWithNonLettersNonSlashAround(original, replacement.old, " " + replacement.new + " ");
                });

                return original;
            });
        });
    })();

    (function addButtonToReplaceParens(){
        var replaceParentWithNoPrefix = function(content, prefix, character, replacement){
            var prefixRegExp = "("+ prefix.split("").map(function(c){
                return "[^" + c.replace("\\", "\\\\") + "]";
            }).join("") + ")";
            console.log(prefixRegExp);
            return content.replace(new RegExp(prefixRegExp + character, 'g'), function(match, prefix){
                return prefix + " " + replacement + " ";
            });
        }

        addButton("nawiasy", function(){
            replaceInLatexTags(function(match, $1){
                var current = replaceParentWithNoPrefix(match, "\\left", "[(]", "\\left(");
                current = replaceParentWithNoPrefix(current, "\\right", "[)]", "\\right)");
                return current;
            });
        });
    })();

    (function watchForDoubleDollar(){
        var postBox = getPostBox();
        var opening = "[latex]";
        var openingReversed = opening.split("").reverse().join("");
        var closing = "[/latex]";
        var closingReversed = closing.split("").reverse().join("");
        postBox.oninput = function(){
            var content = postBox.value;
            var caretPosition = postBox.selectionStart;
            if(caretPosition <= 0 || content[caretPosition - 1] != '$' || content[caretPosition - 2] != '$'){
                return;
            }

            var prefix = content.substring(0, caretPosition - 2);
            var prefixReversed = prefix.split("").reverse().join("");
            var lastOpeningInPrefix = prefixReversed.indexOf(openingReversed);
            var lastClosingInPrefix = prefixReversed.indexOf(closingReversed);
            var isInOpenedTag = lastOpeningInPrefix != -1 && (lastClosingInPrefix == -1 || lastOpeningInPrefix < lastClosingInPrefix);

            var suffix = content.substring(caretPosition);
            var firstOpeningInSuffix = suffix.indexOf(opening);
            var firstClosingInSuffix = suffix.indexOf(closing);
            var isInClosedTag = firstClosingInSuffix != -1 && (firstOpeningInSuffix == -1 || firstClosingInSuffix < firstOpeningInSuffix);

            var changed = false;
            if(!isInOpenedTag && !isInClosedTag){
                prefix += opening;
                changed = true;
            }else if(isInOpenedTag && !isInClosedTag){
                prefix += closing;
                changed = true;
            }else if(!isInOpenedTag && isInClosedTag){
                prefix += opening;
                changed = true;
            }

            if(changed){
                postBox.value = prefix + suffix;
                caretPosition = prefix.length;
                postBox.setSelectionRange(caretPosition, caretPosition);
            }
        }
    })();
})();