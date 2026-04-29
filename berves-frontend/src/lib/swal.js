/**
 * swal.js — Classic SweetAlert2 Modals with Auto-dismiss
 */
import Swal from 'sweetalert2';

const base = {
  target: document.body,
  customClass: {
    popup: 'swal-berves',
    container: 'swal-backdrop',
  },
  buttonsStyling: false,
  scrollbarPadding: false,
  backdrop: true,
  allowOutsideClick: true,
  allowEscapeKey: true,
};

// Auto-dismissing modals (disappear automatically, no OK button needed)
export const swSuccess = (msg) =>
  Swal.fire({
    ...base,
    icon: 'success',
    title: msg,
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true,
    didOpen: () => {
      const popup = Swal.getPopup();
      if (popup) {
        popup.addEventListener('mouseenter', Swal.stopTimer);
        popup.addEventListener('mouseleave', Swal.resumeTimer);
      }
    },
  });

export const swError = (msg = 'Something went wrong. Please try again.') =>
  Swal.fire({
    ...base,
    icon: 'error',
    title: msg,
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: () => {
      const popup = Swal.getPopup();
      if (popup) {
        popup.addEventListener('mouseenter', Swal.stopTimer);
        popup.addEventListener('mouseleave', Swal.resumeTimer);
      }
    },
  });

export const swWarning = (msg) =>
  Swal.fire({
    ...base,
    icon: 'warning',
    title: msg,
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });

export const swInfo = (msg) =>
  Swal.fire({
    ...base,
    icon: 'info',
    title: msg,
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true,
  });

// For basic message without icon
export const swBasic = (msg) =>
  Swal.fire({
    ...base,
    title: msg,
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true,
  });

// Confirmation dialog with Yes/Cancel buttons
export const swConfirm = ({
  title,
  text,
  confirmText = 'Yes, proceed',
  danger = false,
}) =>
  Swal.fire({
    ...base,
    customClass: {
      ...base.customClass,
      popup: danger ? 'swal-berves swal-danger' : 'swal-berves',
    },
    title: title,
    html: text,
    icon: danger ? 'warning' : 'question',
    showCancelButton: true,
    showConfirmButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: 'Cancel',
    reverseButtons: true,
    focusCancel: true,
  });

export const swDelete = (subject = 'this record') =>
  swConfirm({
    title: `Delete ${subject}?`,
    text: 'This action cannot be undone.',
    confirmText: 'Yes, delete',
    danger: true,
  });

export const swLoading = (msg = 'Processing…') =>
  Swal.fire({
    ...base,
    title: msg,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => Swal.showLoading(),
  });

export const swClose = () => Swal.close();

export default {
  swSuccess, swError, swWarning, swInfo, swBasic,
  swConfirm, swDelete, swLoading, swClose,
};