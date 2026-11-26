let savedWorkspaceId = localStorage.getItem('workspaceId');

console.log(savedWorkspaceId);

async function getWorkspaceId(){
    if(savedWorkspaceId){
        return savedWorkspaceId;
    }
    const response = await fetch("http://localhost:3000/api/workspace", {
        method: "POST",
    });
    if(!response.ok){
        throw new Error("Failed to create workspace");
    }
    const workspace = await response.json();
    savedWorkspaceId = workspace.id;
    localStorage.setItem('workspaceId', workspace.id);

    return workspace.id;
}