import React from 'react'

import { Filesystem } from '@daml.js/damlfs-app';
import { userContext } from './App';
import { Form, Button } from 'semantic-ui-react';

type Props = {
    partyToAlias: Map<string, string>
}
/**
 * React component displaying the list of messages for the current user.
 */
const ChangeDirectoryOwner: React.FC<Props> = ({ partyToAlias }) => {

    const dirsResult = userContext.useStreamQueries(Filesystem.Directory);

    const [dirName, setDirName] = React.useState("");
    const [newParty, setNewParty] = React.useState<string | undefined>(undefined);

    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const ledger = userContext.useLedger();

    const aliasToOption = (party: string, alias: string) => {
        return { key: party, text: alias, value: party };
      };
    const options = Array.from(partyToAlias.entries()).map(e =>
        aliasToOption(e[0], e[1]),
    );

    const submitMessage = async (event: React.FormEvent) => {
        try {
            event.preventDefault();
            setIsSubmitting(true);

            if (newParty === undefined) {
                alert("New owner does not exist!");
                return;
            }
            console.log(newParty)

            const contract = dirsResult.contracts.find(d => d.payload.name === dirName)?.contractId;
            if (contract === undefined) {
                alert("Directory does not exist!"); 
                return;
            }
            await ledger.exercise(Filesystem.Directory.ChangeDirectoryOwner, contract, { newParent: null, newOwner: newParty })

            setDirName("")
            setNewParty(undefined)
        } catch (error) {
            alert(`Error sending message:\n${JSON.stringify(error)}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <h3>chown</h3>
            <Form onSubmit={submitMessage}>
                {/* <Form.Input
                    placeholder="New owner"
                    value={newOwner}
                    onChange={event => setNewOwner(event.currentTarget.value)}
                /> */}
                <Form.Select
                    fluid
                    search
                    allowAdditions
                    additionLabel="Insert a party identifier: "
                    additionPosition="bottom"
                    readOnly={isSubmitting}
                    loading={isSubmitting}
                    className="test-select-follow-input"
                    placeholder={newParty ?? "Username to follow"}
                    value={newParty}
                    options={options}
                    onAddItem={(event, { value }) => setNewParty(value?.toString())}
                    onChange={(event, { value }) => setNewParty(value?.toString())}
                />
                <Form.Input
                    placeholder="Directory name"
                    value={dirName}
                    onChange={event => setDirName(event.currentTarget.value)}
                />
                <Button
                    fluid
                    type="submit"
                    disabled={isSubmitting || dirName === "" || newParty === undefined }
                    loading={isSubmitting}
                    content="Send"
                />
            </Form>
        </div>
    );
};

export default ChangeDirectoryOwner;