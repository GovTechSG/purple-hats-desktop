import Button from "../../common/components/Button";
import ButtonSvgIcon from "../../common/components/ButtonSvgIcon";
import "./ErrorPage.scss";
import { useNavigate } from "react-router";
import { ReactComponent as ExclamationCircleIcon } from "../../assets/exclamation-circle.svg";

const ErrorPage = () => {
  const navigate = useNavigate();

  return (
    <div id="error-page">
      <ButtonSvgIcon
        className={`exclamation-circle-icon`}
        svgIcon={<ExclamationCircleIcon />}
      />
      {/* <i className="bi bi-exclamation-circle"></i> */}
      <h1>Something went wrong! Please try again.</h1>
      <Button role="link" type="primary" onClick={() => navigate("/")}>
        Try again
      </Button>
    </div>
  );
};

export default ErrorPage;
