
import { SnackbarAction, SnackbarKey, SnackbarProvider, useSnackbar } from 'notistack';
import Button from '../UI/Components/common/Button';

const SnackbarCloseButton : SnackbarAction = (snackbarKey: SnackbarKey ) => {
  const { closeSnackbar } = useSnackbar();

  return (
    <Button onClick={() => closeSnackbar(snackbarKey)}>
      close
    </Button>
  );
}

export default ()=><SnackbarProvider maxSnack={5} action={SnackbarCloseButton} />