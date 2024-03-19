import axios from "axios";
import {CONTACT_CREATE_ACTIVITY} from '../../../ApiUrl'

export function PostContactActivity(params, token) {
    axios
        .post(CONTACT_CREATE_ACTIVITY, params, {
                headers: {
                    Authorization: token
                },
            }
        )
        .then((res) => {
        })
        .catch((error) => {
        });
};


export const CONTACT_ACTIVITY_MODULE = {
    OPENING: "Opening",
    SUBMISSION: "Submission",
    CONTACT: "Contact",
};
