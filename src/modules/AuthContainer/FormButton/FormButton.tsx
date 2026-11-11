import styles from "./FormButton.module.scss";

interface CustomProps {
  text: string;
}

export type FormButtonProps = CustomProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof CustomProps>;

const FormButton: React.FC<FormButtonProps> = ({ text, ...restProps }) => {
  return (
    <button className={styles.FormButton} {...restProps}>
      {text}
    </button>
  );
};

export default FormButton;
