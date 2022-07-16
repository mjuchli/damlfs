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
const RemoveFile: React.FC<Props> = ({ partyToAlias }) => {
    const filesResult = userContext.useStreamQueries(Filesystem.File);

    const sender = userContext.useParty();
    const [fileName, setFileName] = React.useState("");
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const ledger = userContext.useLedger();

    const submitMessage = async (event: React.FormEvent) => {
        try {
            event.preventDefault();
            setIsSubmitting(true);


            const fileContract = filesResult.contracts.find(d => d.payload.name === fileName)?.contractId;
            if (fileContract === undefined) {
                alert("File does not exist!");
                return;
            }
            await ledger.exercise(Filesystem.File.DeleteFile, fileContract, { })


            setFileName("")
        } catch (error) {
            alert(`Error sending message:\n${JSON.stringify(error)}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <h3>rm</h3>
            <Form onSubmit={submitMessage}>
                {/* <Form.Input
                    placeholder="Parent directory name"
                    value={parentDir}
                    onChange={event => setParentDir(event.currentTarget.value)}
                /> */}
                <Form.Input
                    placeholder="File name"
                    value={fileName}
                    onChange={event => setFileName(event.currentTarget.value)}
                />
                <Button
                    fluid
                    type="submit"
                    disabled={isSubmitting || fileName === "" }
                    loading={isSubmitting}
                    content="Send"
                />
            </Form>
        </div>
    );
};

export default RemoveFile;