import React from 'react'

import { User, Filesystem } from '@daml.js/damlfs-app';
import { userContext } from './App';
import { Form, Button } from 'semantic-ui-react';
import { Party, Optional, ContractId } from '@daml/types';
import { Directory } from '@daml.js/damlfs-app/lib/Filesystem';

type Props = {
    partyToAlias: Map<string, string>
}
/**
 * React component displaying the list of messages for the current user.
 */
const CreateFile: React.FC<Props> = ({ partyToAlias }) => {
    const dirsResult = userContext.useStreamQueries(Filesystem.Directory);

    const sender = userContext.useParty();
    const [parentDir, setParentDir] = React.useState("");
    const [fileName, setFileName] = React.useState("");
    const [content, setContent] = React.useState("");
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const ledger = userContext.useLedger();

    const submitMessage = async (event: React.FormEvent) => {
        try {
            event.preventDefault();
            setIsSubmitting(true);

            const parentContract = dirsResult.contracts.find(d => d.payload.name === parentDir)?.contractId;
            if (parentContract !== undefined) {
                await ledger.exercise(Filesystem.Directory.CreateFile, parentContract, { creator: sender, fileName: fileName, content:content })
            } else {
                alert("Parent directory does not exist!");
            }

            setContent("");
            setParentDir("")
            setFileName("")
        } catch (error) {
            alert(`Error sending message:\n${JSON.stringify(error)}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <h3>touch</h3>
            <Form onSubmit={submitMessage}>
                <Form.Input
                    placeholder="Parent directory name"
                    value={parentDir}
                    onChange={event => setParentDir(event.currentTarget.value)}
                />
                <Form.Input
                    placeholder="File name"
                    value={fileName}
                    onChange={event => setFileName(event.currentTarget.value)}
                />
                <Form.Input
                    placeholder="Content"
                    value={content}
                    onChange={event => setContent(event.currentTarget.value)}
                />
                <Button
                    fluid
                    type="submit"
                    disabled={isSubmitting || fileName === "" || parentDir === ""}
                    loading={isSubmitting}
                    content="Send"
                />
            </Form>
        </div>
    );
};

export default CreateFile;