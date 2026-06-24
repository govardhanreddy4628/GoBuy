import React, { useState } from 'react';
import { TextField, MenuItem, Select, InputLabel, FormControl, Button, Grid, Typography, InputAdornment, FormHelperText } from '@mui/material';
import { Formik, Form, Field, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { SelectChangeEvent } from '@mui/material/Select';

// Mock data for dropdown options
const countryList: string[] = ["USA", "India", "UK"];
const organizationTypes: string[] = ["Non-profit", "Corporation", "Startup"];
const organizationNames: { [key: string]: string[] } = {
  "Non-profit": ["NGO1", "NGO2"],
  "Corporation": ["Corp1", "Corp2"],
  "Startup": ["Startup1", "Startup2"]
};
const registrationNumbers: { [key: string]: string } = {
  "NGO1": "NP-1234",
  "NGO2": "NP-5678",
  "Corp1": "C-4321",
  "Corp2": "C-8765",
  "Startup1": "S-9876",
  "Startup2": "S-5432"
};

// Dynamic States based on Country
const stateOptions: { [key: string]: string[] } = {
  "USA": ["California", "Texas"],
  "India": ["Karnataka", "Delhi"],
  "UK": ["England", "Scotland"]
};

// Formik Form Values Type
interface FormValues {
  name: string;
  email: string;
  organizationType: string;
  organizationName: string;
  registrationNumber: string;
  mobileNumber: string;
  country: string;
  address: {
    houseNumber: string;
    district: string;
    state: string;
  };
}

const AddressForm = () => {
  const [orgNames, setOrgNames] = useState<string[]>([]);

  // Handle Organization Type Change
  const handleTypeChange = (
    event: SelectChangeEvent,
    setFieldValue: (field: string, value: any) => void
  ) => {
    const type = event.target.value;
    setOrgNames(organizationNames[type] || []);
    setFieldValue("organizationType", type);
    setFieldValue("organizationName", '');
  };

  // Handle Country Change
  const handleCountryChange = (
    event: SelectChangeEvent,
    setFieldValue: (field: string, value: any) => void
  ) => {
    const country = event.target.value;
    setFieldValue("country", country);
    setFieldValue("address.state", '');
  };

  // Validation Schema with Yup
  const validationSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    email: Yup.string().email('Invalid email format').required('Email is required'),
    organizationType: Yup.string().required('Organization type is required'),
    organizationName: Yup.string().required('Organization name is required'),
    mobileNumber: Yup.string().required('Mobile number is required').matches(/^\d{10}$/, 'Mobile number must be 10 digits'),
    country: Yup.string().required('Country is required'),
    address: Yup.object({
      houseNumber: Yup.string().required('House number is required'),
      district: Yup.string().required('District is required'),
      state: Yup.string().required('State is required')
    })
  });

  return (
    <div className='max-w-4xl mx-auto'>
      <Typography variant="h5" className='text-gray-700 text-center p-6 font-bold text-shadow-md'>Register Form</Typography>
      <Formik<FormValues>
        initialValues={{
          name: '',
          email: '',
          organizationType: '',
          organizationName: '',
          registrationNumber: '',
          mobileNumber: '',
          country: '',
          address: {
            houseNumber: '',
            district: '',
            state: ''
          }
        }}
        validationSchema={validationSchema}
        onSubmit={(values, { setSubmitting }: FormikHelpers<FormValues>) => {
          console.log(values);
          setSubmitting(false);
        }}
      >
        {({ setFieldValue, values, errors, touched }) => (
          <Form>
            <Grid container spacing={3}>
              {/* Name */}
              <Grid item xs={12} sm={6}>
                <Field
                  name="name"
                  label="Name"
                  fullWidth
                  component={TextField}
                  
                  helperText={touched.name && errors.name}
                  error={touched.name && Boolean(errors.name)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccountCircle />
                      </InputAdornment>
                    )
                  }}
                  sx={{borderRadius:"50%"}}
                />
              </Grid>

              {/* Email */}
              <Grid item xs={12} sm={6}>
                <Field
                  name="email"
                  label="Email"
                  fullWidth
                  type="email"
                  component={TextField}
                  helperText={touched.email && errors.email}
                  error={touched.email && Boolean(errors.email)}
                />
              </Grid>

              {/* Organization Type */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={touched.organizationType && Boolean(errors.organizationType)}>
                  <InputLabel>Type of Organization</InputLabel>
                  <Select
                    label="Type of Organization"
                    name="organizationType"
                    value={values.organizationType}
                    onChange={(e) => handleTypeChange(e, setFieldValue)}
                  >
                    {organizationTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                  {/* {touched.organizationType && errors.organizationType && (
                    <Typography color="error">{errors.organizationType}</Typography>
                  )} */}
                  
                  <FormHelperText id="component-error-text">{touched.organizationType && errors.organizationType}</FormHelperText>
                  
                </FormControl>
              </Grid>

              {/* Organization Name */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Organization Name</InputLabel>
                  <Select
                    label="Organization Name"
                    name="organizationName"
                    value={values.organizationName}
                    disabled={!values.organizationType}
                    onChange={(e) => {
                      const orgName = e.target.value as string;
                      setFieldValue("organizationName", orgName);
                      setFieldValue("registrationNumber", registrationNumbers[orgName] || "");
                    }}
                  >
                    {orgNames.map((orgName) => (
                      <MenuItem key={orgName} value={orgName}>
                        {orgName}
                      </MenuItem>
                    ))}
                  </Select>
                  {touched.organizationName && errors.organizationName && (
                    <Typography color="error">{errors.organizationName}</Typography>
                  )}
                </FormControl>
              </Grid>

              {/* Registration Number */}
              <Grid item xs={12} sm={6}>
                <Field
                  name="registrationNumber"
                  label="Registration Number"
                  fullWidth
                  component={TextField}
                  value={values.registrationNumber}
                  disabled
                />
              </Grid>

              {/* Mobile Number */}
              <Grid item xs={12} sm={6}>
                <Field
                  name="mobileNumber"
                  label="Mobile Number"
                  fullWidth
                  component={TextField}
                  helperText={touched.mobileNumber && errors.mobileNumber}
                  error={touched.mobileNumber && Boolean(errors.mobileNumber)}
                />
              </Grid>

              {/* Country */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Country</InputLabel>
                  <Select
                    label="Country"
                    name="country"
                    value={values.country}
                    onChange={(e) => handleCountryChange(e, setFieldValue)}
                  >
                    {countryList.map((country) => (
                      <MenuItem key={country} value={country}>
                        {country}
                      </MenuItem>
                    ))}
                  </Select>
                  {touched.country && errors.country && (
                    <Typography color="error">{errors.country}</Typography>
                  )}
                </FormControl>
              </Grid>

              {/* Address Fields */}
              <Grid item xs={12} sm={6}>
                <Field
                  name="address.houseNumber"
                  label="House Number"
                  fullWidth
                  component={TextField}
                  helperText={touched.address?.houseNumber && errors.address?.houseNumber}
                  error={touched.address?.houseNumber && Boolean(errors.address?.houseNumber)}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Field
                  name="address.district"
                  label="District"
                  fullWidth
                  component={TextField}
                  helperText={touched.address?.district && errors.address?.district}
                  error={touched.address?.district && Boolean(errors.address?.district)}
                />
              </Grid>

              {/* State (dynamic based on Country selection) */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>State</InputLabel>
                  <Select
                    label="State"
                    name="address.state"
                    value={values.address.state}
                    onChange={(e) => setFieldValue("address.state", e.target.value)}
                  >
                    {stateOptions[values.country]?.map((state) => (
                      <MenuItem key={state} value={state}>
                        {state}
                      </MenuItem>
                    ))}
                  </Select>
                  {touched.address?.state && errors.address?.state && (
                    <Typography color="error">{errors.address?.state}</Typography>
                  )}
                </FormControl>
              </Grid>

              {/* Submit Button */}
              <Grid item xs={12}>
                <Button type="submit" variant="contained" color="primary">
                  Submit
                </Button>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default AddressForm;
