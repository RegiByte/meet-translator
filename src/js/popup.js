import "../css/popup.css";
import React from "react";
import { render } from "react-dom";
import TranslationList from "./popup/translationListComponent";

render(
  <TranslationList/>,
  window.document.getElementById("root")
);
