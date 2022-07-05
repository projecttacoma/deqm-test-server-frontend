import React from "react";
import CodeMirror from "@uiw/react-codemirror";
import { useState } from "react";
import { json, jsonParseLinter } from "@codemirror/lang-json";
import { linter } from "@codemirror/lint";
import { Button, Center } from "@mantine/core";

const jsonLinter = jsonParseLinter();

/**
 * interface for the props that a ResourceCodeEditor component takes in.
 * initialValue is what the code editor will contain initially
 * onClickFunction is the function that should be executed when the ResourceCodeEditor's submit button is clicked.
 */
export interface ResourceCodeEditorProps {
  initialValue: string;
  onClickFunction: (submittedVal: string) => void;
  buttonName: string;
}

/**
 * ResourceCodeEditor is a component for rendering a Code Editor with a submit Button component that executes the function specified in the props.
 * The function called when the submit button is clicked is passed the Code Editor's current contents
 * @param props see interface ResourceCodeEditorProps
 * @returns React node composed of a CodeMirror component and a submit button that executes the function passed via props
 */
const ResourceCodeEditor = (props: ResourceCodeEditorProps) => {
  const [currentValue, setCurrentValue] = useState(props.initialValue);
  const [hasLintError, setHasLintError] = useState(true);

  return (
    <div>
      <CodeMirror
        data-testid="resource-code-editor"
        value={currentValue}
        height="500px"
        extensions={[json(), linter(jsonLinter)]}
        onUpdate={(v) => {
          const diagnosticMessages = jsonLinter(v.view).map((d) => d.message);

          if (diagnosticMessages.length === 0) {
            setHasLintError(false);
          } else {
            setHasLintError(true);
          }
          setCurrentValue(v.state.toJSON().doc);
        }}
      />
      <Center>
        <div style={{ paddingTop: "24px" }}>
          <Button
            disabled={hasLintError}
            onClick={() => props.onClickFunction(currentValue)}
            color="cyan"
            variant="filled"
            size="lg"
          >
            {props.buttonName}
          </Button>
        </div>
      </Center>
    </div>
  );
};
export default ResourceCodeEditor;
