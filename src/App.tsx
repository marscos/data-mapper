import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./components/ui/resizable";
import ACEFieldMapper from "./components/fieldmapper";
import { Textarea } from "./components/ui/textarea";
import { useState } from "react";
import type { ACEData } from "./ACESchema";

function App() {
  const [inputData, setInputData] = useState({});
  const [inputIsValid, setInputIsValid] = useState(true);
  const [outputData, setOutputData] = useState<ACEData | {}>({});

  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="w-screen max-h-screen border-2"
    >
      <ResizablePanel id="input" className="flex flex-col items-stretch p-1">
        <label htmlFor="input-data">Input data</label>
        <Textarea
          id="input-data"
          className={`resize-none grow ${inputIsValid ? "" : "border-red-600"}`}
          onBlur={(ev) => {
            try {
              const json = JSON.parse(ev.target.value);
              setInputData(json);
              setInputIsValid(true);
            } catch (SyntaxError) {
              setInputData({});
              setInputIsValid(false);
            }
          }}
        ></Textarea>
        {inputIsValid ? null : (
          <em role="alert" className="text-red-600">
            Invalid JSON input
          </em>
        )}
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel id="mapper" className="p-1">
        <ACEFieldMapper
          inputData={inputData}
          onFormSubmit={setOutputData}
        ></ACEFieldMapper>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel id="output" className="flex flex-col items-stretch p-1">
        <label htmlFor="output-data">Output data</label>
        <Textarea
          readOnly
          className="resize-none grow"
          id="output-data"
          value={JSON.stringify(
            outputData,
            (_, value) => (value === "" || value === 0 ? undefined : value),
            2
          )}
        ></Textarea>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

export default App;
