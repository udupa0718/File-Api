const forgot_pass_template = (email,token,url) => {
    return `<html>
            <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                *{
                    box-sizing: border-box;
                }
                body {
                    margin: 0;
                    height: 50vh;
                    width: 100%;
                    overflow-x: hidden;
                    background-color: #ccc;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    flex-direction:row;
                }
                
                .container {
                    display: flex;
                    flex-direction:column;
                    height: 100vh;
                    width: 100%;
                    justify-content: center;
                    align-items: center;
                    background-color: #fff;
                    padding: 20px;
                    color: #222;
                    gap: 30px;
                }

                .title h1 {
                    text-align: center;
                    color: blue;
                }

                .content {
                    text-align: center;
                }

                .content .btn {
                    padding: 12px 14px;
                    width: 5vm;
                    background-color: red;
                    color: #fff;
                    font-weight: bold;
                    font-size: 1.2rem;
                    border: none;
                    border-radius: 10px;
                    text-decoration: none;
                    cursor: pointer;
                }

                @media screen and (max-width: 768px) {
                    .container {
                        height: 100vh;
                        width: 100%;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        margin-top: 100px;
                    }
                }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="title">
                        <h1> Password Reset </h1>
                    </div>
                    <div class="content">
                        <p>Seems like you forgot your password for ${url}. if this is true, click
                        below link to reset your password. </p>
                        <a href="${url}/email/${email}/token/${token}" class="btn" target="_blank">Reset My
                        Password</a>
                    </div>
                    <div class="note">
                        <p> If you did not forgot your password you can safely ignore this email.</p>
                    </div>
                </div>
            </body>
        </html>`
}

module.exports = forgot_pass_template