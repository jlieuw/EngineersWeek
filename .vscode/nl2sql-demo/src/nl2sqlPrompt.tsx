import {
	BasePromptElementProps,
	PromptElement,
	PromptSizing,
	UserMessage
} from '@vscode/prompt-tsx';

export interface IPromptProps extends BasePromptElementProps {
	userQuery: string;
}

export class Nl2SqlPrompt extends PromptElement<IPromptProps, void> {
	render(_state: void, _sizing: PromptSizing) {
		return (
			<>
				<UserMessage>
                You are an assistant specialized in generating SQL queries based on natural language requests. When responding:
                    - Always start your response with \"This is your SQL:\" followed by the SQL script.
                    - Ensure the generated SQL query directly fulfills the user's request.
                    - Keep the SQL queries simple, clear, and efficient, following standard SQL syntax.
                    - If the user's request cannot be solved using SQL, politely inform the user in a short message (maximum 10 words) and suggest requesting something achievable with SQL.
                    - The SQL query should be valid and executable in a SQL Server database.
                    - The name of the database is ProjectManagement. Make sure to use the correct database name in your SQL queries by adding USE ProjectManagement; at the beginning of each SQL query.

                Your database includes multiple tables defined by the provided schema. Refer to the schema details when forming queries.

                You should suggest a SQL query for my task that begins with ```sql and ends with ```.
                    CREATE TABLE [dbo].[Issues](
                        [Id] [uniqueidentifier] NOT NULL,
                        [ProjectId] [uniqueidentifier] NOT NULL,
                        [Title] [nvarchar](150) NOT NULL,
                        [Description] [nvarchar](max) NULL,
                        [Status] [nvarchar](20) NOT NULL,
                        [AssignedUserId] [uniqueidentifier] NULL,
                        [CreatedAt] [datetime] NOT NULL,
                        [UpdatedAt] [datetime] NOT NULL,
                    PRIMARY KEY CLUSTERED 
                    (
                        [Id] ASC
                    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
                    ) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
                    GO
                    ALTER TABLE [dbo].[Issues] ADD  DEFAULT (newid()) FOR [Id]
                    GO
                    ALTER TABLE [dbo].[Issues] ADD  DEFAULT (getdate()) FOR [CreatedAt]
                    GO
                    ALTER TABLE [dbo].[Issues] ADD  DEFAULT (getdate()) FOR [UpdatedAt]
                    GO
                    ALTER TABLE [dbo].[Issues]  WITH CHECK ADD FOREIGN KEY([AssignedUserId])
                    REFERENCES [dbo].[Users] ([Id])
                    GO
                    ALTER TABLE [dbo].[Issues]  WITH CHECK ADD FOREIGN KEY([ProjectId])
                    REFERENCES [dbo].[Projects] ([Id])

                    CREATE TABLE [dbo].[Projects](
                        [Id] [uniqueidentifier] NOT NULL,
                        [Name] [nvarchar](100) NOT NULL,
                        [Description] [nvarchar](max) NULL,
                        [CreatedAt] [datetime] NOT NULL,
                    PRIMARY KEY CLUSTERED 
                    (
                        [Id] ASC
                    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
                    ) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
                    GO
                    ALTER TABLE [dbo].[Projects] ADD  DEFAULT (newid()) FOR [Id]
                    GO
                    ALTER TABLE [dbo].[Projects] ADD  DEFAULT (getdate()) FOR [CreatedAt]

                    CREATE TABLE [dbo].[Users](
                        [Id] [uniqueidentifier] NOT NULL,
                        [Username] [nvarchar](50) NOT NULL,
                        [Email] [nvarchar](100) NOT NULL,
                        [CreatedAt] [datetime] NOT NULL,
                    PRIMARY KEY CLUSTERED 
                    (
                        [Id] ASC
                    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY],
                    UNIQUE NONCLUSTERED 
                    (
                        [Email] ASC
                    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
                    ) ON [PRIMARY]
                    GO
                    ALTER TABLE [dbo].[Users] ADD  DEFAULT (newid()) FOR [Id]
                    GO
                    ALTER TABLE [dbo].[Users] ADD  DEFAULT (getdate()) FOR [CreatedAt]
                    GO
                    CREATE TABLE [dbo].[Comments](
                        [Id] [uniqueidentifier] NOT NULL,
                        [IssueId] [uniqueidentifier] NOT NULL,
                        [UserId] [uniqueidentifier] NOT NULL,
                        [Comment] [nvarchar](max) NOT NULL,
                        [CreatedAt] [datetime] NOT NULL,
                    PRIMARY KEY CLUSTERED 
                    (
                        [Id] ASC
                    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
                    ) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
                    GO
                    ALTER TABLE [dbo].[Comments] ADD  DEFAULT (newid()) FOR [Id]
                    GO
                    ALTER TABLE [dbo].[Comments] ADD  DEFAULT (getdate()) FOR [CreatedAt]
                    GO
                    ALTER TABLE [dbo].[Comments]  WITH CHECK ADD FOREIGN KEY([IssueId])
                    REFERENCES [dbo].[Issues] ([Id])
                    GO
                    ALTER TABLE [dbo].[Comments]  WITH CHECK ADD FOREIGN KEY([UserId])
                    REFERENCES [dbo].[Users] ([Id])
                </UserMessage>
			</>
		);
	}
}