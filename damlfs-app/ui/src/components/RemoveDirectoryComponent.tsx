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
const RemoveDirectory: React.FC<Props> = ({ partyToAlias }) => {

    const dirsResult = userContext.useStreamQueries(Filesystem.Directory);

    const sender = userContext.useParty();
    const [dirName, setDirName] = React.useState("");
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const ledger = userContext.useLedger();

    const submitMessage = async (event: React.FormEvent) => {
        try {
            event.preventDefault();
            setIsSubmitting(true);


            const contract = dirsResult.contracts.find(d => d.payload.name === dirName)?.contractId;
            if (contract === undefined) {
                alert("File name does not exist!"); 
                return;
            }
            await ledger.exercise(Filesystem.Directory.DeleteDirectory, contract, { user: sender })


            setDirName("")
        } catch (error) {
            alert(`Error sending message:\n${JSON.stringify(error)}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <h3>rm -Rf</h3>
            <Form onSubmit={submitMessage}>
                <Form.Input
                    placeholder="Directory name"
                    value={dirName}
                    onChange={event => setDirName(event.currentTarget.value)}
                />
                <Button
                    fluid
                    type="submit"
                    disabled={isSubmitting || dirName === "" }
                    loading={isSubmitting}
                    content="Send"
                />
            </Form>
        </div>
    );
};

export default RemoveDirectory;