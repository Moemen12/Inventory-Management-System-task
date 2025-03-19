const API_BASE_URL = "http://127.0.0.1:8000/api/v1";

const BARCODE_FORMATS: BarcodeFormat[] = [
  "qr_code",
  "micro_qr_code",
  "rm_qr_code",
  "maxi_code",
  "pdf417",
  "aztec",
  "data_matrix",
  "matrix_codes",
  "dx_film_edge",
  "databar",
  "databar_expanded",
  "codabar",
  "code_39",
  "code_93",
  "code_128",
  "ean_8",
  "ean_13",
  "itf",
  "linear_codes",
  "upc_a",
  "upc_e",
];

export { API_BASE_URL, BARCODE_FORMATS };
