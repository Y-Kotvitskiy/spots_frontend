import styles from "./Button.module.scss";

interface CustomProps {
  text: string;
  classNames?: string | string[];
}

export type FormButtonProps = CustomProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof CustomProps>;

const FormButton: React.FC<FormButtonProps> = ({ text, ...restProps }) => {
  return (
    <button className={styles.Button} {...restProps}>
      {text}
    </button>
  );
};

export default FormButton;
