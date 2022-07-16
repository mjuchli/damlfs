import React from 'react'

import { Filesystem } from '@daml.js/damlfs-app';
import { userContext } from './App';
import { Form, Button } from 'semantic-ui-react';
import { Directory } from '@daml.js/damlfs-app/lib/Filesystem';

type Props = {
    partyToAlias: Map<string, string>
}
/**
 * React component displaying the list of messages for the current user.
 */
const CreateDirectory: React.FC<Props> = ({ partyToAlias }) => {
    const dirsResult = userContext.useStreamQueries(Filesystem.Directory);

    const sender = userContext.useParty();
    const [parentDir, setParentDir] = React.useState("");
    const [content, setContent] = React.useState("");
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const ledger = userContext.useLedger();

    const submitMessage = async (event: React.FormEvent) => {
        try {
            event.preventDefault();

            setIsSubmitting(true);
            if (parentDir !== "") {
                const parentContract = dirsResult.contracts.find(d => d.payload.name === parentDir)?.contractId;
                if (parentContract !== undefined) {
                    await ledger.exercise(Filesystem.Directory.CreateDirectory, parentContract, { dirName: content })
                } else {
                    alert("Parent directory does not exist!");
                }

            } else {
                const r = await ledger.create(Filesystem.Directory, {
                    creator: sender,
                    parent: null,
                    name: content,
                    owner: sender,
                    files: [],
                    directories: []
                } as Directory)
                console.log(r);
            }

            setContent("");
            setParentDir("")
        } catch (error) {
            alert(`Error sending message:\n${JSON.stringify(error)}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <h3>mkdir</h3>
            <Form onSubmit={submitMessage}>
                <Form.Input
                    placeholder="Parent directory name"
                    value={parentDir}
                    onChange={event => setParentDir(event.currentTarget.value)}
                />
                <Form.Input
                    placeholder="Directory name"
                    value={content}
                    onChange={event => setContent(event.currentTarget.value)}
                />
                <Button
                    fluid
                    type="submit"
                    disabled={isSubmitting || content === ""}
                    loading={isSubmitting}
                    content="Send"
                />
            </Form>
        </div>
    );
};

export default CreateDirectory;