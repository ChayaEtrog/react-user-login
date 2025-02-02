import { useContext, useEffect, useRef, useState } from "react";
import { UserContext } from "./UseReducer";
import { Box, Button, Modal, TextField } from "@mui/material";
import axios from "axios";
import ErrorMessage from "./ErrorMessage";

function FormModel({ setIsOpen, type, setIsLogedIn }: { setIsOpen: any, type: string, setIsLogedIn?: any }) {
    const { user, userDispatch } = useContext(UserContext);
    const [isSubmitOk, setIsSubmitOk] = useState(true);
    const [open, setOpen] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const firstNameRef = useRef<HTMLInputElement>(null);
    const lastNameRef = useRef<HTMLInputElement>(null);
    const emailRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const addressRef = useRef<HTMLInputElement>(null);
    const phoneRef = useRef<HTMLInputElement>(null);

    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: '#f9f9f9',
        borderRadius: '16px',
        boxShadow: 24,
        p: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    };

    const handleInputChange = () => {
        const isEmailValid = emailRef.current?.checkValidity() ?? false;
        const isPasswordValid = passwordRef.current?.checkValidity() ?? false;
        setIsSubmitOk(!(isEmailValid && isPasswordValid));
    };

    useEffect(() => {
        setIsSubmitOk(!(user.email && user.password));
    }, []);


   //Calling an asynchronous function to register
    const handleSignup = async (newUserData: any) => {
        const res = await axios.post('http://localhost:3000/api/user/register', {
            email: emailRef.current?.value,
            password: passwordRef.current?.value
        });
        console.log(res);
        newUserData.userId = res.data.userId;
        userDispatch({ type: "CREATE_USER", data: newUserData });
        setIsLogedIn();
    };

    // Calling an asynchronous function to login
    const handleLogin = async (newUserData: any) => {
        const res = await axios.post('http://localhost:3000/api/user/login', {
            email: emailRef.current?.value,
            password: passwordRef.current?.value
        });
        newUserData.userId = res.data.user.id;
        userDispatch({ type: "CREATE_USER", data: newUserData });
        setIsLogedIn();
    };

    //Calling an asynchronous function to update user information
    const handleUpdate = async (newUserData: any) => {
        const res = await axios.put('http://localhost:3000/api/user', {
            email: emailRef.current?.value,
            password: passwordRef.current?.value,
            firstName: firstNameRef.current?.value,
            lastName: lastNameRef.current?.value,
            address: addressRef.current?.value,
            phone: phoneRef.current?.value
        }, {
            headers: { 'user-id': '' + user.userId }
        });
        userDispatch({ type: "UPDATE_USER", data: newUserData });
    };

    //An asynchronous function to connect 
    const handleSubmit = async () => {
        const newUserData = {
            firstName: firstNameRef.current?.value || "",
            lastName: lastNameRef.current?.value || "",
            email: emailRef.current?.value || "",
            password: passwordRef.current?.value || "",
            address: addressRef.current?.value || "",
            phone: phoneRef.current?.value || "",
            userId: user.userId || "",
        };


        try {
            //Try to perform all the asynchronous actions
            if (type === "SIGNUP") {
                await handleSignup(newUserData);
            } else if (type === "LOGIN") {
                await handleLogin(newUserData);
            } else {
                await handleUpdate(newUserData);
            }

            // Close the form only if no error occurred
            setIsOpen(false);

        } catch (e: any) {
            console.error('Error during form submission:', e);

            //Display the error message
            if (e.response?.status === 401) {
                setError('Invalid credentials');
            } else if (e.response?.status === 422) {
                setError('User already registered');
            } else if (e.response?.status === 404) {
                setError('User not found');
            }

        };
    }

    return <>
        {(error) && <ErrorMessage message={error} />}
        <Modal open={open} onClose={() => setOpen(false)}>
            <Box sx={style} >

                <TextField label="email" type='email' defaultValue={user.email} inputRef={emailRef} margin="dense" required onInput={handleInputChange} />
                <TextField label="password" defaultValue={user.password} type='password' inputRef={passwordRef} margin="dense" required onInput={handleInputChange} />
                {(type === 'UPDATE') && (<>
                    <TextField label="first name" type="text" defaultValue={user.firstName} inputRef={firstNameRef} margin="dense" />
                    <TextField label="last name" type="text" defaultValue={user.lastName} inputRef={lastNameRef} margin="dense" />
                    <TextField label="address" defaultValue={user.address} type='text' inputRef={addressRef} margin="dense" />
                    <TextField label="phon number" defaultValue={user.phone} type='tel' inputRef={phoneRef} margin="dense" />
                </>)}
                <div> <Button onClick={handleSubmit} variant="outlined" disabled={isSubmitOk}>Submit</Button></div>
            </Box>
        </Modal >
    </>
}
export default FormModel;