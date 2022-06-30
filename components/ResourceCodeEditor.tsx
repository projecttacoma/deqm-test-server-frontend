import React from "react";
import CodeMirror from "@uiw/react-codemirror";
import { useState } from "react";
import { json } from "@codemirror/lang-json";
import { Button } from "@mantine/core";

/**
 * interface for the props that a ResourceCodeEditor component takes in.
 * initialValue is what the code editor will contain initially
 * onClickFunction is the function that should be executed when the ResourceCodeEditor's submit button is clicked.
 */
export interface ResourceCodeEditorProps {
  initialValue: string;
  onClickFunction: (submittedVal: string) => void;
}

/**
 * ResourceCodeEditor is a component for rendering a Code Editor with a submit Button component that executes the function specified in the props.
 * The function called when the submit button is clicked is passed the Code Editor's current contents
 * @param props see interface ResourceCodeEditorProps
 * @returns React node composed of a CodeMirror component and a submit button that executes the function passed via props
 */
const ResourceCodeEditor = (props: ResourceCodeEditorProps) => {
  const [currentValue, setCurrentValue] = useState(props.initialValue);

  return (
    <div>
      <CodeMirror
        value={currentValue}
        height="500px"
        extensions={[json()]}
        onChange={(v) => {
          setCurrentValue(v);
        }}
      />
      <br /> <br />
      <div style={{ textAlign: "center" }}>
        <Button
          onClick={() => props.onClickFunction(currentValue)}
          color="cyan"
          variant="filled"
          size="lg"
        >
          Submit Resource
        </Button>
      </div>
    </div>
  );
};
export default ResourceCodeEditor;
