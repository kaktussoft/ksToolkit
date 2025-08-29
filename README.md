# KaktusSoft Toolkit (javascript library)
## function CreateOutput
Documentation can be found on https://dev.to/ron_clarijs/create-data-reports-using-javascript-function-15dc
## function GroupBy
Helper function for CreateOutput. See CreateOutput documentation.
## function transferData
See source code. It is a wrapper function around fetch API. It is self-explanatory.
## function processResponsePromise
See source code. It converts its input to JSON. It is self-explanatory.
## function getServerDataMakeReportPutInElem
See source code. It is kind of executing transferData -> processResponsePromise -> CreateOutput and put output in a HTML element. It is self-explanatory. 
- Only arguments url, mode and data are allowed for function transferData.
- Only argument reportDefinition is allowed for function createOutput.
## function navEvent
See source code. It is self-explanatory.
## function htmlSanitize
See source code. It is self-explanatory.
