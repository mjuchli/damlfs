import React from 'react'
import { List, ListItem } from 'semantic-ui-react';
import { Filesystem } from '@daml.js/damlfs-app';
import { userContext } from './App';


type Props = {
    partyToAlias: Map<string, string>
}

type FileTree = {
    contract: string,
    name: string,
    owner: string,
    directories: FileTree[],
    files: Filesystem.File[]
}

/**
 * React component displaying the list of messages for the current user.
 */
const FileTree: React.FC<Props> = ({ partyToAlias }) => {

    const dirsResult = userContext.useStreamQueries(Filesystem.Directory);
    const filesResult = userContext.useStreamQueries(Filesystem.File);

    const dirContractToPayload = dirsResult.contracts.reduce((map, c) => {
        map.set(c.contractId, c.payload!)
        return map
    }, new Map<string, Filesystem.Directory>());

    const fileContractToPayload = filesResult.contracts.reduce((map, c) => {
        map.set(c.contractId, c.payload!)
        return map
    }, new Map<string, Filesystem.File>());

    const dom = (
        <div>
            <h2>Filetree</h2>
            #dirs: {dirsResult.contracts.filter(c => c.payload.owner === userContext.useParty()).length}
            &nbsp;&nbsp;&nbsp;
            #files: {filesResult.contracts.filter(c => c.payload.owner === userContext.useParty()).length}
            <List relaxed>
                {dirsResult.contracts.filter(c => c.payload.owner === userContext.useParty()).filter(c => c.payload.parent === null).map(dir => {
                    const contract = dir.contractId;
                    const { name, owner, directories, files } = dir.payload;
                    return (
                        <div>
                            <ListItem
                                className='test-select-message-item'
                                key={contract}>
                                <strong>{partyToAlias.get(owner) ?? owner}:</strong> {name}
                                {
                                    directories.map(d => {
                                        const subdir = dirContractToPayload.get(d);
                                        return (
                                            <ListItem key={subdir?.name}>
                                                -- (d) {subdir?.name}
                                            </ListItem>
                                        )
                                    })
                                }
                                {
                                    files.map(f => {
                                        const file = fileContractToPayload.get(f);
                                        return (
                                            <ListItem key={file?.name}>
                                                -- {file?.name} ("{file?.content}")
                                            </ListItem>
                                        )
                                    })
                                }
                            </ListItem>
                        </div>
                    );
                })}
            </List>
        </div>
    )

    return dom

};

export default FileTree;