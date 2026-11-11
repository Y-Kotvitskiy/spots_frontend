import styles from "./Button.module.scss";

interface CustomProps {
  text: string;
  classNames?: string | string[];
  variant?: "default" | "grey" | "danger";
}

export type FormButtonProps = CustomProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof CustomProps>;

const FormButton: React.FC<FormButtonProps> = ({
  text,
  classNames,
  variant = "default",
  ...restProps 
}) => {

  const variantClass = 
    variant === "grey" ? styles.Button_grey :
    variant === "danger" ? styles.Button_danger : "";

  const formattedClassNames = Array.isArray(classNames)
    ? classNames.join(" ")
    : classNames;

  const combinedClassName = [
    styles.Button,
    variantClass,
    formattedClassNames,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={combinedClassName} {...restProps}>
      {text}
    </button>
  );
};

export default FormButton;