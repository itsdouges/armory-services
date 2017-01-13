// eslint-disable-next-line
export const forgotMyPassword = (id) =>
`<h2>Forgot My Password</h2>

Hi, you requested to reset your password.
Please <a href="https://gw2armory.com/forgot-my-password?token=${id}"> click here to finish
resetting your password</a>.
<br />
<br />
Optionally copy this into the token reset field: ${id}
<br />
<br />
Cheers,<br />
Guild Wars 2 Armory
<br /><br />
<small>Please don't reply to this email, you won't get a response.</small>
`;
