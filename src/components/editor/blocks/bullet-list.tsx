import { defaultProps } from "@blocknote/core";
import { createReactBlockSpec } from "@blocknote/react";
 
import { Search, AlertTriangle, InfoIcon as LucideInfoIcon, CheckCircle } from "lucide-react";
 
// The types of alerts that users can choose from.
export const alertTypes = [
  {
    title: "Warning",
    value: "warning",
    icon: AlertTriangle,
    color: "#facc15",
    backgroundColor: {
      light: "#fefce8",
      dark: "#854d0e",
    },
  },
  {
    title: "Error",
    value: "error",
    icon: AlertTriangle,
    color: "#f87171",
    backgroundColor: {
      light: "#ffe4e6",
      dark: "#991b1b",
    },
  },
  {
    title: "Info",
    value: "info",
    icon: LucideInfoIcon,
    color: "#60a5fa",
    backgroundColor: {
      light: "#e0f2fe",
      dark: "#1e40af",
    },
  },
  {
    title: "Success",
    value: "success",
    icon: CheckCircle,
    color: "#4ade80",
    backgroundColor: {
      light: "#f0fdf4",
      dark: "#166534",
    },
  },
] as const;
 
// The Alert block.
export const Alert = createReactBlockSpec(
  {
    type: "alert",
    propSchema: {
      textAlignment: defaultProps.textAlignment,
      textColor: defaultProps.textColor,
      type: {
        default: "warning",
        values: ["warning", "error", "info", "success"],
      },
    },
    content: "inline",
  },
  {
    render: (props) => {
      const alertType = alertTypes.find(
        (a) => a.value === props.block.props.type
      ) || alertTypes[0];
      const Icon = alertType.icon;
      return (
        <div className={"alert"} data-alert-type={props.block.props.type}>
       
       <div className="bg-red-500 p-3">
       <div className={"inline-content"} ref={props.contentRef} />

       </div>
        </div>
      );
    },
  }
);
 