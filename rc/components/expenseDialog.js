

import { useState, useEffect } from 'react';
import { Avatar, Button, Dialog, DialogActions, DialogContent, Link, Stack, TextField, Typography } from '@mui/material';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import DatePicker from '@mui/lab/DatePicker';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import { useAuth } from '../firebase/auth';
import { addReceipt, updateReceipt } from '../firebase/firestore';
import { processImage } from '../firebase/functions';
import { ocrFeatureFlag } from '../firebase/remoteConfig';
import { uploadImage } from '../firebase/storage';
import { RECEIPTS_ENUM } from '../pages/dashboard';
import styles from '../styles/expenseDialog.module.scss';

const DEFAULT_FILE_NAME = "No file selected";

// Default form state for the dialog
const DEFAULT_FORM_STATE = {
  address: "",
  amount: "",
  date: null,
  fileName: DEFAULT_FILE_NAME,
  file: null,
  imageBucket: "",
  imageUrl: "",
  isConfirmed: false,
  items: "",
  locationName: "",
};

const ADD_EXPENSE_TITLE = "Add Expense";
const EDIT_EXPENSE_TITLE = "Edit Expense";
const CONFIRM_EXPENSE_TITLE = "Confirm Expense";

/* 
 Dialog to input receipt information
 
 props:
  - receipt is the receipt to edit if the dialog is being opened to edit, otherwise {}
  - action is the action for which this dialog was opened
  - onError emits to notify error occurred
  - onSuccess emits to notify successfully saving receipt
  - onCloseDialog emits to close dialog
 */
export default function expenseDialog(props) {
  const isAdd = props.action === RECEIPTS_ENUM.add;
  const isEdit = props.action === RECEIPTS_ENUM.edit;
  const isConfirm = props.action === RECEIPTS_ENUM.confirm;
  
  const { authUser } = useAuth();
  const [formFields, setFormFields] = useState((isEdit || isConfirm) ? props.receipt : DEFAULT_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set dialog title based on action
  let dialogTitle = ADD_EXPENSE_TITLE;
  if (isEdit) {
    dialogTitle = EDIT_EXPENSE_TITLE;
  } else if (isConfirm) {
    dialogTitle = CONFIRM_EXPENSE_TITLE;
  }

  // If the receipt to edit or whether to close or open the dialog ever changes, reset the form fields
  useEffect(() => {
    if (props.showDialog) {
      setFormFields(isEdit ? props.edit : DEFAULT_FORM_STATE);
    }
  }, [props.edit, props.showDialog])

  // Check whether any of the form fields are unedited
  const isDisabled = () => 
    !isAdd ? 
      formFields.fileName === DEFAULT_FILE_NAME || !formFields.date || formFields.locationName.length === 0 
             || formFields.address.length === 0 || formFields.items.length === 0 || formFields.amount.length === 0 :
      formFields.fileName === DEFAULT_FILE_NAME;

  // Set the relevant fields for receipt image
  const setFileData = (target) => {
    const file = target.files[0];
    setFormFields(prevState => ({...prevState, fileName: file.name}));
    setFormFields(prevState => ({...prevState, file}));
  }

  const closeDialog = () => {
    setIsSubmitting(false);
    props.onCloseDialog();
  }

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      if (isAdd) {
        // Adding receipt
        // Store image into Storage
        const bucket = await uploadImage(formFields.file, authUser.uid);

        if (ocrFeatureFlag) {
          processImage({ bucket, uid: authUser.uid });
        } else {
          await addReceipt(authUser.uid, formFields.date, formFields.locationName, formFields.address, formFields.items, formFields.amount, bucket);
        }
      } else {
        // Confirming or updating receipt (not allowing re-upload of images)
        if (!ocrFeatureFlag && formFields.fileName) {
          // Store image into Storage
          await replaceImage(formFields.file, formFields.imageBucket);
        }
        // Update receipt in Firestore
        await updateReceipt(formFields.id, authUser.uid, formFields.date, formFields.locationName, formFields.address, formFields.items, formFields.amount, formFields.imageBucket, true);
      }
      props.onSuccess(props.action);
    } catch (error) {
      props.onError(props.action);
    }

    // Clear all form data
    closeDialog();
  };

  return (
    <div>
    <Dialog classes={{paper: styles.dialog}}
      onClose={closeDialog}
      open={isEdit || isConfirm || isAdd}
      component="form">
      <Typography variant="h4" className={styles.title}>{dialogTitle}</Typography>
      <DialogContent className={styles.pickImage}>
        {<Stack direction="row" spacing={2} className={styles.receiptImage}>
          {!formFields.fileName && 
            <Link href={formFields.imageUrl} target="_blank">
              <Avatar alt="receipt image" src={formFields.imageUrl} />
            </Link>
          }
          { (isAdd || (isEdit && !ocrFeatureFlag)) &&
            <Button variant="outlined" component="label" color="secondary">
              Upload Receipt
              <input type="file" hidden onInput={(event) => {setFileData(event.target)}} />
            </Button>
          }
          <Typography>{formFields.fileName}</Typography>
        </Stack>
        }
        {(isEdit || isConfirm || !ocrFeatureFlag) ?
          <Stack className={styles.fields}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Date"
                value={formFields.date}
                onChange={(newDate) => {
                  setFormFields(prevState => ({...prevState, date: newDate}));
                }}
                maxDate={new Date()}
                renderInput={(params) => <TextField {...params} />}
              />
            </LocalizationProvider>
            <TextField color="tertiary" label="Location name" variant="standard" value={formFields.locationName} onChange={(event) => setFormFields(prevState => ({...prevState, locationName: event.target.value}))} />
            <TextField color="tertiary" label="Location address" variant="standard" value={formFields.address} onChange={(event) => setFormFields(prevState => ({...prevState, address: event.target.value}))} />
            <TextField color="tertiary" label="Items" variant="standard" value={formFields.items} onChange={(event) => setFormFields(prevState => ({...prevState, items: event.target.value}))}/>
            <TextField color="tertiary" label="Amount" variant="standard" value={formFields.amount} onChange={(event) => setFormFields(prevState => ({...prevState, amount: event.target.value}))} />
          </Stack> : <div></div>
        }
      </DialogContent>
      <DialogActions>
        {isSubmitting ? 
          <Button color="secondary" variant="contained" disabled={true}>
            {isConfirm ? 'Confirming...' : 'Submitting...'}
          </Button> :
          <Button color="secondary" variant="contained" onClick={handleSubmit} disabled={isDisabled()}>
            {isConfirm ? 'Confirm' : 'Submit'}
          </Button>
        }
      </DialogActions>
    </Dialog>
</div>
  )
}