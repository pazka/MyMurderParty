
import { SnackbarAction, SnackbarKey, SnackbarProvider, useSnackbar } from 'notistack';

const SnackbarCloseButton : SnackbarAction = (snackbarKey: SnackbarKey ) => {
  const { closeSnackbar } = useSnackbar();

  return (
    <button onClick={() => closeSnackbar(snackbarKey)}>
      close
    </button>
  );
}

export default ()=><SnackbarProvider maxSnack={5} action={SnackbarCloseButton} />