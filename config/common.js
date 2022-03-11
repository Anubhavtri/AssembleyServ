module.exports = {
    testPassword: function (pass) {
        let pattern = /^([^0-9]*)$/;
        let regex = /^[A-Za-z]+$/
        let isnum = /^\d+$/.test(pass);
        let format = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
        let containSpecialCharactersOrNot = format.test(pass);
        if (pass.length < 5) {
            // callback(null, {
            // 	statusCode: 400,
            // 	body: JSON.stringify({ status: 'Error', message: 'Your password must contain minimum 5 characters.' })
            // })
            return 'Your password must contain minimum 5 characters.';
        }
        else if (pass.length > 32) {
            // callback(null, {
            // 	statusCode: 400,
            // 	body: JSON.stringify({ status: 'Error', message: 'Your password crosses maximum length 32.' })
            // });
            return 'Your password crosses maximum length 32.';
        } else if (pass.match(pattern)) {
            // callback(null, {
            // 	statusCode: 400,
            // 	body: JSON.stringify({ status: 'Error', message: 'Your password must contain at least one number.' })
            // });
            return 'Your password must contain at least one number.';
        } else if (isnum) {
            // callback(null, {
            // 	statusCode: 400,
            // 	body: JSON.stringify({ status: 'Error', message: 'Your password must contain at least one alphabet.' })
            // });
            return 'Your password must contain at least one alphabet.';
        } else if (!containSpecialCharactersOrNot) {
            // callback(null, {
            // 	statusCode: 400,
            // 	body: JSON.stringify({ status: 'Error', message: 'Your password must contain at least one special character.' })
            // });
            return 'Your password must contain at least one special character.';
        }
        else {
            return true;
        }
    },
    mobileNumberValidation: function (number){
		let isnum = /^\d+$/.test(number);
		if (!isnum) {
			// callback(null, {
			//   statusCode: 400,
			//   body: JSON.stringify({ status: 'Error', message: 'Invalid Phone Number' })
			// })
			return 'Invalid Phone Number';
		} else if (number.toString().length != 10) {
			// callback(null, {
			//   statusCode: 400,
			//   body: JSON.stringify({ status: 'Error', message: 'Phone number length must be 10 digits.' })
			// })
			return 'Phone number length must be 10 digits.';
		}
		else {
			return true;
		}
	},
    
}