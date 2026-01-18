import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Typography,
} from '@mui/material';

export default function TermsOfServiceModal({ open, onClose, onAgree }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      scroll='paper'
      aria-labelledby='tos-dialog-title'
      aria-describedby='tos-dialog-description'
    >
      <DialogTitle id='tos-dialog-title'>Terms of Service</DialogTitle>
      <DialogContent dividers>
        <DialogContentText id='tos-dialog-description' component='div'>
          <Typography variant='h6' gutterBottom>
            1. Acceptance of Terms
          </Typography>
          <Typography paragraph variant='body2'>
            By accessing and using Luca Ledger (&quot;the Application&quot;),
            you acknowledge that you have read, understood, and agree to be
            these Terms of Service.
          </Typography>

          <Typography variant='h6' gutterBottom>
            2. No Financial Advice
          </Typography>
          <Typography paragraph variant='body2'>
            The Application is provided for informational and personal finance
            management purposes only. It does not constitute financial,
            investment, legal, or tax advice. You should consult with a
            qualified professional for advice specific to your situation.
          </Typography>

          <Typography variant='h6' gutterBottom>
            3. Data Security and Privacy
          </Typography>
          <Typography paragraph variant='body2'>
            While we employ industry-standard encryption (AES-256) to protect
            your data locally on your device, you acknowledge that no method of
            electronic storage is 100% secure. You are solely responsible for
            maintaining the confidentiality of your password and for any loss of
            data resulting from a lost password or compromised device.
          </Typography>

          <Typography variant='h6' gutterBottom>
            4. Limitation of Liability
          </Typography>
          <Typography paragraph variant='body2'>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, LUCA FINANCIAL AND ITS
            DEVELOPERS SHALL NOT BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
            SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT
            LIMITED TO LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE
            LOSSES, RESULTING FROM (A) YOUR ACCESS TO OR USE OF OR INABILITY TO
            ACCESS OR USE THE APPLICATION; (B) ANY CONDUCT OR CONTENT OF ANY
            THIRD PARTY ON THE APPLICATION; OR (C) UNAUTHORIZED ACCESS, USE, OR
            ALTERATION OF YOUR TRANSMISSIONS OR CONTENT.
          </Typography>

          <Typography variant='h6' gutterBottom>
            5. &quot;As Is&quot; Basis
          </Typography>
          <Typography paragraph variant='body2'>
            The Application is provided on an &quot;AS IS&quot; and &quot;AS
            AVAILABLE&quot; basis. We make no representations or warranties of
            any kind, express or implied, regarding the operation of the
            Application or the information, content, or materials included
            therein.
          </Typography>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        {onAgree ? (
          <>
            <Button onClick={onClose} color='inherit'>
              Disagree
            </Button>
            <Button onClick={onAgree} variant='contained' color='primary'>
              Agree
            </Button>
          </>
        ) : (
          <Button onClick={onClose} color='primary'>
            Close
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

TermsOfServiceModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onAgree: PropTypes.func,
};
